# openssl req -new -text -out server.req
# openssl rsa -in privkey.pem -out server.key
# rm privkey.pem
# openssl req -x509 -in server.req -text -key server.key -out server.crt
# # now we have server.crt and server.key

openssl genrsa -des3 -out root.key 1024
openssl req -new -key root.key -out root.csr
cp root.key root.key.org
openssl rsa -in root.key.org -out root.key
openssl x509 -req -days 365 -in root.csr -signkey root.key -out root.crt
