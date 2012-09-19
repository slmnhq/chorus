scp client.crt gpadmin@chorus-gpdb42:/gpdata1/gpsne0/gpfdists/client.crt
scp client.key gpadmin@chorus-gpdb42:/gpdata1/gpsne0/gpfdists/client.key
scp root.crt   gpadmin@chorus-gpdb42:/gpdata1/gpsne0/gpfdists/root.crt

scp client.crt gpadmin@chorus-gpdb42:/gpdata2/gpsne1/gpfdists/client.crt
scp client.key gpadmin@chorus-gpdb42:/gpdata2/gpsne1/gpfdists/client.key
scp root.crt   gpadmin@chorus-gpdb42:/gpdata2/gpsne1/gpfdists/root.crt

scp client.crt gpadmin@chorus-gpdb41:/data1/primary/gpseg0/gpfdists/client.crt
scp client.key gpadmin@chorus-gpdb41:/data1/primary/gpseg0/gpfdists/client.key
scp root.crt   gpadmin@chorus-gpdb41:/data1/primary/gpseg0/gpfdists/root.crt

scp client.crt gpadmin@chorus-gpdb41:/data2/primary/gpseg1/gpfdists/client.crt
scp client.key gpadmin@chorus-gpdb41:/data2/primary/gpseg1/gpfdists/client.key
scp root.crt   gpadmin@chorus-gpdb41:/data2/primary/gpseg1/gpfdists/root.crt

# on gpfdist server:
# - The server certificate file, server.crt
# - The server private key file, server.key
# - The trusted certificate authorities, root.crt

scp root.crt pivotal@chorus-staging:/home/pivotal/greenplum-loaders-4.2.2.0-build-5/certs/server.crt
scp root.key pivotal@chorus-staging:/home/pivotal/greenplum-loaders-4.2.2.0-build-5/certs/server.key
scp root.crt   pivotal@chorus-staging:/home/pivotal/greenplum-loaders-4.2.2.0-build-5/certs/root.crt