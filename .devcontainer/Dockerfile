FROM node:16-alpine3.14
RUN npm i -g @nestjs/cli \
 && apk add git

USER node

ENV HOME /home/node

RUN mkdir /home/node/portfolio-inc-var-api
WORKDIR /home/node/portfolio-inc-var-api

RUN mkdir -p ${HOME}/commandhistory \
    && echo "eval \$(ssh-agent) && ssh-add ~/.ssh/id_rsa"  >> ${HOME}/.bashrc \
    && echo "export PROMPT_COMMAND='history -a'" >> ${HOME}/.bashrc \
    && echo "export HISTFILE=~/commandhistory/.bash_history" >> ${HOME}/.bashrc