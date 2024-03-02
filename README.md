Navigate to the server directory:
Bash
cd server

Install dependencies:
Bash
yarn install

Navigate to each client application directory (gz_webtracker, gz_webdriver, gz_webadmin) and install dependencies:
Bash
cd gz_webtracker && yarn install
cd gz_webdriver && yarn install
cd gz_webadmin && yarn install

Running the Application
Starting the Server:

Navigate to the server directory:
Bash
cd server

Start the server using Yarn with a custom port (3000):
Bash
yarn start --port 3000

Starting the Front-end Applications:
Navigate to each client application directory:
cd gz_webtracker
cd gz_webdriver
cd gz_webadmin
Start each application using Angular CLI's ng serve command with custom ports (42000, 42001, 42002):
ng serve --port 42000 (gz_webtracker)
ng serve --port 42001 (gz_webdriver)
ng serve --port 42002 (gz_webadmin)
