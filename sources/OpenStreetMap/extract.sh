if [ ! -f osmconvert ]; then
    echo "[warn] osmconvert not found, installing"
    wget -O - http://m.m.i24.cc/osmconvert.c | cc -x c - -lz -O3 -o osmconvert
fi
echo "[info] installed osmconvert"

if [ ! -f osmfilter ]; then
    echo "[warn] osmfilter not found, installing"
    wget -O - http://m.m.i24.cc/osmfilter.c | cc -x c - -O3 -o osmfilter
fi
echo "[info] installed osmfilter"

if [ ! -f planet-latest.osm.pbf ]; then
    echo "[warn] no planet found, downloading"
    wget http://download.geofabrik.de/europe-latest.osm.pbf -O planet-latest.osm.pbf
else
    echo "[info] skip download"
fi

echo "[info] Converting pbf"
./osmconvert planet-latest.osm.pbf -o=temp.osm 

echo "[info] extracting drinkwater related objects from OpenStreetMap"
./osmfilter temp.osm --ignore-dependencies --keep-ways= --keep-relations= --keep= --keep-nodes="amenity=drinking_water man_made=tap_water" > drinkwater.osm

rm temp.osm
echo "[info] finished"