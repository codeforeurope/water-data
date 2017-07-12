#!/bin/bash
wget -nc https://github.com/tabulapdf/tabula-java/releases/download/0.9.2/tabula-0.9.2-jar-with-dependencies.jar
wget -nc -P ../reports/oasen https://www.oasen.nl/assets/uploads/Kwaliteitgegevens_Hooge-Boom-Kamerik_ZHB_0.pdf
wget -nc -P ../reports/oasen https://www.oasen.nl/assets/uploads/Kwaliteitgegevens_De%20Steeg_ZSL_0.pdf
wget -nc -P ../reports/oasen https://www.oasen.nl/assets/uploads/Kwaliteitgegevens_De-Laak-Lexmond_ZLA.pdf
wget -nc -P ../reports/oasen https://www.oasen.nl/assets/uploads/Kwaliteitgegevens_SPS-Alblasserdam_DAD.pdf
wget -nc -P ../reports/oasen https://www.oasen.nl/assets/uploads/Kwaliteitgegevens_Rodenhuis-Bergambacht_ZRH_0.pdf
wget -nc -P ../reports/oasen https://www.oasen.nl/assets/uploads/Kwaliteitgegevens_Reijerwaard-Ridderkerk_ZRD.pdf
wget -nc -P ../reports/oasen https://www.oasen.nl/assets/uploads/Kwaliteitgegevens_Elzengors-Evides-Zwijndrecht_DZD_0.pdf
wget -nc -P ../reports/oasen https://www.oasen.nl/assets/uploads/Kwaliteitgegevens_Lekkerkerk_ZLK.PDF
java -jar tabula-0.9.2-jar-with-dependencies.jar -g -t -f CSV -o ../reports/oasen/ -b ../reports/oasen
npm install csvtojson
node oasen_tabula.js
rm ../reports/oasen/*.csv;