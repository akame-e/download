#!/bin/bash

# Install rclone static binary
wget -q https://github.com/Kwok1am/rclone-ac/releases/download/gclone/gclone.gz
gunzip gclone.gz
export PATH=$PWD:$PATH
chmod 777 /app/gclone

#Inject Rclone config
wget -q https://github.com/akame-e/download/raw/main/accounts.rar
wget -q https://www.rarlab.com/rar/rarlinux-x64-5.9.0.tar.gz
tar xf rarlinux-x64-5.9.0.tar.gz
export PATH=$PWD/rar:$PATH
unrar -p"${SA_SECRET}" e accounts.rar /app/accounts/

# Install aria2c static binary
wget -q https://raw.githubusercontent.com/fzfile/heroku-aria2c/master/aria2.zip
unzip -q aria2.zip
export PATH=$PWD/Aria2:$PATH
chmod 777 ./Aria2/aria2c

# Create download folder
mkdir -p downloads

# DHT
wget -q https://github.com/P3TERX/aria2.conf/raw/master/dht.dat
wget -q https://github.com/P3TERX/aria2.conf/raw/master/dht6.dat

# Tracker
file="trackers.txt"
echo "$(curl -Ns https://trackerslist.com/all_aria2.txt)" > trackers.txt
echo "$(curl -Ns https://cdn.jsdelivr.net/gh/XIU2/TrackersListCollection@master/all_aria2.txt)" >> trackers.txt
echo "$(curl -Ns https://trackers.p3terx.com/all_aria2.txt)" >> trackers.txt
tmp=$(cat trackers.txt | uniq) && echo "$tmp" > trackers.txt
sed -i '/^$/d' trackers.txt
sed -i ':a;N;s/\n/,/g;ta'  trackers.txt
tracker_list=$(cat trackers.txt)
if [ $file ] ; then
    rm -rf $file
fi
echo "adding trackers, exclude-trackers and set listen-port=$PORT,$XPORT"
echo "bt-tracker=$tracker_list" >> aria2c.conf
echo "listen-port=$PORT,$XPORT,$((PORT - 1))-$((PORT + 1))" >> aria2c.conf
#echo "dht-message-timeout=$DHT_TIMEOUT" >> aria2c.conf

echo $PATH > PATH
