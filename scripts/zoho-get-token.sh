# use this request to get a refresh token (long lived token)
# make sure to replace the code value with the code you received
# from https://api-console.zoho.com/client/1000.2RJNUW4QERMHDUHIOLNUYMG7RSSFLT
# https://www.zoho.com/accounts/protocol/oauth/self-client/authorization-code-flow.html

# also replace client secret
http POST https://accounts.zoho.com/oauth/v2/token \
  client_id==1000.2RJNUW4QERMHDUHIOLNUYMG7RSSFLT \
  client_secret== \
  grant_type==authorization_code \
  code==
