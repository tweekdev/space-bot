FROM centos:latest

ENV TZ Europe/Paris
RUN cp /usr/share/zoneinfo/Europe/Paris /etc/localtime

RUN yum -y install epel-release curl gcc-c++ make
RUN curl -sL https://rpm.nodesource.com/setup_11.x | bash -
RUN yum -y install nodejs

WORKDIR /app

COPY package.json .

RUN npm i -g forever \
    && npm i

COPY . .

CMD ["forever", "app.js"]
