FROM node:lts-buster

# Clone ENTIER du repo (obligatoire)
RUN git clone https://github.com/vtry813-sketch/fluffy-engine.git

# Dossier du projet
WORKDIR /root/fluffy-engine

# Installation des dépendances
RUN npm install
RUN npm install -g pm2

# Copie des fichiers locaux (si tu en as)
COPY . .

# Port d'exposition
EXPOSE 9090

# Commande de démarrage
CMD ["npm", "start"]


