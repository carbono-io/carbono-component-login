#
# carbono-component-login Dockerfile
#
# https://bitbucket.org/carbonoio/carbono-component-login
#

# Pull base image.
FROM mongo

# Install everything
RUN \
  apt-get update                                         && \
  apt-get install -y curl                                && \
  curl -sL https://deb.nodesource.com/setup_4.x | bash - && \
  apt-get install -y nodejs                              && \
  apt-get install -y supervisor                          && \
  apt-get remove -y curl                                 && \
  apt-get autoremove -y                                  && \
  apt-get clean                                          && \
  npm install -g mongodb-rest

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY . /carbono-component-login

EXPOSE 7799

# Define working directory.
WORKDIR /data

# Define default command.
ENTRYPOINT ["/usr/bin/supervisord"]
