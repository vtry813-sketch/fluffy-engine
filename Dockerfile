FROM node:lts-buster

# Dossier de travail
WORKDIR /app

# Copier tout le code depuis Render vers Docker
COPY . .

# Installer dépendances
RUN npm install --production

# Exposer le port Render
EXPOSE 10000

# Indique à Node le fichier principal
ENV MAIN_FILE=index.js

# Lancer l’application
CMD ["node", "inconnu.js"]
