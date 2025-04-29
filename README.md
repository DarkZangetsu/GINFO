Enter file contents hereVoici un exemple de `README.md` minimaliste pour un projet utilisant **Django comme backend** et **Next.js comme frontend**, avec uniquement les instructions d’installation :

```markdown
# Installation du projet

## Prérequis

- Python 3.10+
- Node.js 18+
- npm ou yarn
- PostgreSQL ou SQLite (selon le projet)
- (Optionnel) `virtualenv` pour isoler l'environnement Python

---

## Backend (Django)

1. Aller dans le dossier backend :
   ```bash
   cd back_ginfo
   ```

2. Créer et activer un environnement virtuel :
   ```bash
   python -m venv env
   source env/bin/activate  # Sur Windows : env\Scripts\activate
   ```

3. Installer les dépendances :
   ```bash
   pip install -r requirements.txt
   ```

4. Lancer les migrations :
   ```bash
   python manage.py migrate
   ```

5. Lancer le serveur :
   ```bash
   python manage.py runserver
   ```

---

## Frontend (Next.js)

1. Aller dans le dossier frontend :
   ```bash
   cd front_ginfo
   ```

2. Installer les dépendances :
   ```bash
   npm install
   # ou
   yarn
   ```

3. Lancer le serveur de développement :
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

---

## Accès

- Backend : [http://localhost:8000](http://localhost:8000)
- Frontend : [http://localhost:3000](http://localhost:3000)
```
