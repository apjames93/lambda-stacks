import subprocess
import sys
import os

# Download Certbot package
subprocess.check_call([sys.executable, "-m", "pip", "install", "--target", "/tmp/certbot", "certbot"])

# Add the Certbot package to sys.path
sys.path.append("/tmp/certbot")

import certbot.main
import boto3
import zipfile
import shutil
import uuid
import logging
import json
import os
from datetime import datetime, timezone
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

#This is staging server
CERTBOT_SERVER = 'https://acme-staging-v02.api.letsencrypt.org/directory'

#Get clients
region = os.environ.get('AWS_REGION', 'us-east-2')  # Default to 'us-east-2' if not specified

s3 = boto3.client('s3', region_name=region)
acm = boto3.client('acm', region_name=region)

def create_s3_bucket(bucket_name):
    ''' Create an S3 bucket if it doesn't exist

    Args:
        bucket_name (str): Name of the S3 bucket
        public_bucket (bool): Whether to create a public S3 bucket

    '''
    try:
        # Create the bucket with the default (private) ACL
        s3.create_bucket(
            Bucket=bucket_name,
            CreateBucketConfiguration={'LocationConstraint': region}
        )

        logger.info('S3 bucket {} created successfully.'.format(bucket_name))
    except ClientError as e:
        if e.response['Error']['Code'] == 'BucketAlreadyOwnedByYou':
            logger.info('S3 bucket {} already exists.'.format(bucket_name))
        else:
            logger.error('Error creating S3 bucket {}: {}'.format(bucket_name, e))



def create_s3_domain_bucket(bucket_name):
    ''' Create an S3 bucket if it doesn't exist and configure for hosting a static website

    Args:
        bucket_name (str): Name of the S3 bucket

    '''
    try:
        # Create the bucket with the default (private) ACL
        s3.create_bucket(
            Bucket=bucket_name,
            CreateBucketConfiguration={'LocationConstraint': region},
        )
        s3.put_public_access_block(Bucket=bucket_name, PublicAccessBlockConfiguration={'BlockPublicAcls': False,'IgnorePublicAcls': False,'BlockPublicPolicy': False,'RestrictPublicBuckets': False})

        # Check if index.html exists, if not, upload the default index.html
        if not object_exists(bucket_name, 'index.html'):
            s3.upload_file('lib/index.html', bucket_name, 'index.html')

        # Check if error.html exists, if not, upload the default error.html
        if not object_exists(bucket_name, 'error.html'):
            s3.upload_file('lib/error.html', bucket_name, 'error.html')

        # If public_bucket is True, set a bucket policy to allow public reads
        bucket_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
                }
            ]
        }

        s3.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(bucket_policy))

        # Configure the bucket for static website hosting
        s3.put_bucket_website(
            Bucket=bucket_name,
            WebsiteConfiguration={
                'ErrorDocument': {'Key': 'error.html'},
                'IndexDocument': {'Suffix': 'index.html'},
            }
        )

        # Set the bucket ACL to public
        s3.put_bucket_acl(
            Bucket=bucket_name,
            AccessControlPolicy={
                'Grants': [
                    {
                        'Grantee': {
                            'Type': 'Group',
                            'URI': 'http://acs.amazonaws.com/groups/global/AllUsers',
                        },
                        'Permission': 'READ',
                    },
                ],
                'Owner': {
                    'DisplayName': 'string',
                    'ID': 'string',
                },
            }
        )

        logger.info('S3 bucket {} created and configured successfully.'.format(bucket_name))
    except ClientError as e:
        if e.response['Error']['Code'] == 'BucketAlreadyOwnedByYou':
            logger.info('S3 bucket {} already exists.'.format(bucket_name))
        else:
            logger.error('Error creating S3 bucket {}: {}'.format(bucket_name, e))

def object_exists(bucket_name, key):
    try:
        s3.head_object(Bucket=bucket_name, Key=key)
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == '404':
            return False
        else:
            raise


def update_symlinks(domain):
    ''' The dark side of the symlinks, required by Certbot and not restored by
        zipfile. This method recreates symlinks for specified domain, removing 
        regular files.
    '''
    for k in ['cert', 'chain', 'privkey', 'fullchain']:
        try:
            os.remove('/tmp/certbot/config/live/{}/{}.pem'.format(domain,k))
        except:
            pass
        os.symlink('/tmp/certbot/config/archive/{}/{}1.pem'.format(domain,k), 
                   '/tmp/certbot/config/live/{}/{}.pem'.format(domain,k))


def renew_certs(domains):
    ''' Request update if specified domain cert.
    '''
    certbot_args = [
        # Override directory paths so script doesn't have to be run as root
        '--config-dir', '/tmp/certbot/config',
        '--work-dir', '/tmp/certbot/work',
        '--logs-dir', '/tmp/certbot/logs',

        '--force-renewal',

        # Renew
        'renew',

        '--cert-name', domains,

    ]
    certbot.main.main(certbot_args)

def request_certs(emails, domains):
    ''' Request a new cert for specified domain, hosted in a public access S3 bucket.
        'auth-hook.py' script is used in validation, to upload Certbot token to the bucket
        'cleanup-hook.py' script is used after validation to remove token file in bucket 
    '''
    certbot_args = [
        # Override directory paths to use /tmp folder
        '--config-dir', '/tmp/certbot/config',
        '--work-dir', '/tmp/certbot/work',
        '--logs-dir', '/tmp/certbot/logs',

        # Request cert
        'certonly',

        # Manual installation
        '--manual',

        # Domain 
        '--domains', domains,

        # Run in non-interactive mode
        '--non-interactive',

        # Agree
        '--manual-public-ip-logging-ok',

        # Agree to the terms of service
        '--agree-tos',

        # Email of domain administrators
        '--email', emails,

        # Validation scripts
        '--manual-auth-hook', 'python auth-hook.py',
        '--manual-cleanup-hook', 'python cleanup-hook.py',
        '--preferred-challenges', 'http',

        # Debug for debug
        '--debug',

    ]

    # Stage or Prod?
    if os.environ['CERTBOT_ENV'] == 'staging':
        certbot_args.extend(['--server', CERTBOT_SERVER])

    certbot.main.main(certbot_args)

def zipdir(path, ziph):
    ''' Zip a dir (recursive)
    '''
    for root, dirs, files in os.walk(path):
        for file in files:
            ziph.write(os.path.join(root, file))

def restore_certbot_tree():
    ''' Download certbot configuration tree (zipped) from S3 bucket
        and extract it in /tmp folder 
    '''
    try:
        s3.download_file(os.environ['CERTBOT_BUCKET'], os.environ['CERTBOT_OBJECT'], '/tmp/certbot.zip')
        with zipfile.ZipFile('/tmp/certbot.zip','r') as zip_ref:
            zip_ref.extractall('/')
        os.remove('/tmp/certbot.zip')
    except ClientError as e:
        logger.warning(e)      

def backup_certbot_tree():  
    ''' Backup certbot configuration tree (zipped) to S3 bucket
    ''' 
    zipf = zipfile.ZipFile('/tmp/certbot.zip', 'w', zipfile.ZIP_DEFLATED)
    zipdir('/tmp/certbot/config', zipf)
    zipf.close()
    s3.upload_file('/tmp/certbot.zip', os.environ['CERTBOT_BUCKET'], os.environ['CERTBOT_OBJECT'])
    os.remove('/tmp/certbot.zip')

def cleanup():
    ''' Remove all certbot files from Lambda instance 
    '''
    try:
        shutil.rmtree('/tmp/certbot') 
    except:
        pass

def get_domain_arn(domain, certs_list):
    ''' Parse ACM response to get ARN of a specific domain cert  
    '''
    arn = ''
    for c in certs_list['CertificateSummaryList']:
        if (c['DomainName'] == domain):
            arn = c['CertificateArn']
            break
    return arn

def get_domain_expiration_in_days(cert_arn):
    ''' Request details of a specific domain cert and
        return number of days before expiration
    '''
    c = acm.describe_certificate(
        CertificateArn=cert_arn
    )
    expireAt = c['Certificate']['NotAfter']
    return (expireAt - datetime.now(timezone.utc)).days


def get_file_contents(filename):
    ''' Return (binary) file contents
    '''
    in_file = open(filename, "rb") 
    data = in_file.read() 
    in_file.close()
    return data

def test_policy(domain):
    ''' Check if lambda role allows upload and delete of object in domain bucket
    '''
    test_filename = str(uuid.uuid4())
    open('/tmp/{}'.format(test_filename), 'a').close()
    try:
        # Check PutObject policy
        s3.upload_file('/tmp/{}'.format(test_filename), domain, test_filename)
        # Check DeleteObject policy
        s3.delete_object(Bucket=domain, Key=test_filename)
    except:
        return False
    os.remove('/tmp/{}'.format(test_filename))
    return True

def lambda_handler(event, context):
    # Check if the S3 bucket exists, and create it if not
    create_s3_bucket(os.environ['CERTBOT_BUCKET'])

    # Check domain list
    if (os.environ['DOMAINS_LIST'] != '') and (os.environ['DOMAINS_EMAIL'] != ''):
            
        # Stage or Prod?
        if os.environ['CERTBOT_ENV'] == 'staging':
            logger.info("Using Certbot staging server {}".format(CERTBOT_SERVER))
            
        logger.info("Domain list is {}".format(os.environ['DOMAINS_LIST']))

        certs_new, certs_renew, certs_imported, certs_skipped = 0,0,0,0

        # restore certbot configuration tree
        restore_certbot_tree()

        # ACM -> get list of certificates
        certs_list = acm.list_certificates()
        logger.info(certs_list)

        # Parse os.environ['DOMAINS_LIST'] to process specified domains
        for domain in os.environ['DOMAINS_LIST'].split(','):
            create_s3_domain_bucket(domain)

            arn = get_domain_arn(domain, certs_list)
            if (arn == ''):
                # not installed in ACM
                if not os.path.exists('/tmp/certbot/config/live/{}/cert.pem'.format(domain)):
                    # check if lambda role allows upload/delete to domain bucket
                    if test_policy(domain):
                        # cert not yet requested, get it by certbot
                        logger.info('Cert request for domain {}'.format(domain))
                        request_certs(os.environ['DOMAINS_EMAIL'], domain)
                        certs_new += 1
                    else:
                        certs_skipped += 1
                        logger.error('Please add PutObject and DeleteObject permissions to lambda role for bucket {}'.format(domain))
                        continue

                # upload new cert to ACM
                logger.info('Import cert for domain {} to ACM'.format(domain))
                response = acm.import_certificate(
                            Certificate=get_file_contents('/tmp/certbot/config/live/{}/cert.pem'.format(domain)), 
                            PrivateKey=get_file_contents('/tmp/certbot/config/live/{}/privkey.pem'.format(domain)), 
                            CertificateChain=get_file_contents('/tmp/certbot/config/live/{}/chain.pem'.format(domain))
                )
                certs_imported += 1
                logger.info(response)
            else:
                # already installed in ACM, check expiration
                if (get_domain_expiration_in_days(arn) < int(os.environ['CERTS_RENEW_DAYS_BEFORE_EXPIRATION'])):
                    # need to be renewed. Fix links
                    update_symlinks(domain)
                    # request renew cert
                    logger.info('Renew cert for domain {}'.format(domain))
                    renew_certs(domain)
                    certs_renew += 1
                    # import it to ACM replacing old cert
                    logger.info('Replace cert for domain {} in ACM'.format(domain))
                    response = acm.import_certificate(
                                CertificateArn=arn,
                                Certificate=get_file_contents('/tmp/certbot/config/live/{}/cert.pem'.format(domain)), 
                                PrivateKey=get_file_contents('/tmp/certbot/config/live/{}/privkey.pem'.format(domain)), 
                                CertificateChain=get_file_contents('/tmp/certbot/config/live/{}/chain.pem'.format(domain))
                    )
                    certs_imported += 1
                    logger.info(response)
                else:
                    certs_skipped += 1

        # backup configuration tree to a s3 bucket
        backup_certbot_tree()
    
        # empty tmp folder!
        cleanup()

        result = {
                "message": "{} new certs, {} renewed certs, {} certs imported and {} certs skipped.".format(certs_new, certs_renew, certs_imported, certs_skipped)
        } 

    else:
        result = {
                "message": "nothing to do. Please set DOMAINS_LIST and DOMAINS_EMAIL."
        } 
    
    return result
