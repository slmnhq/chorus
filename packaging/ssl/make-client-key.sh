openssl req -new -key client.key -out client.csr
openssl ca -in client.csr -cert ./root.crt -keyfile ./root.key -out client.crt