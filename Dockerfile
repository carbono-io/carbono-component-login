#
# carbono-component-login Dockerfile
#
# https://bitbucket.org/carbonoio/carbono-component-login
#

FROM node
COPY . /carbono-component-login
RUN mkdir /code

EXPOSE 7799

CMD ["/bin/sh", "-c", "cd /carbono-component-login && node ."]
