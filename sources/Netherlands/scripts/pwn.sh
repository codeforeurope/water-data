#!/bin/bash
wget -nc https://github.com/tabulapdf/tabula-java/releases/download/0.9.2/tabula-0.9.2-jar-with-dependencies.jar
java -jar tabula-0.9.2-jar-with-dependencies.jar -g -f CSV -o ../reports/pwn/ -b ../reports/pwn

npm install csvtojson
node pwn_tabula.js
rm ../reports/pwn/*.csv
