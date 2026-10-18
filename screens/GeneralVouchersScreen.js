import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, Platform, View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import Notice from '../components/Notice';

const SUCCESS_SOUND_HTML = '<!DOCTYPE html><html><body><script>var ctx=new(window.AudioContext||window.webkitAudioContext)();function p(f,s,d){var o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=f;o.type="sine";g.gain.setValueAtTime(0,ctx.currentTime+s);g.gain.linearRampToValueAtTime(1.0,ctx.currentTime+s+0.05);g.gain.linearRampToValueAtTime(0,ctx.currentTime+s+d);o.start(ctx.currentTime+s);o.stop(ctx.currentTime+s+d+0.1);}p(523.25,0,0.15);p(659.25,0.18,0.15);p(783.99,0.36,0.3);<\/script></body></html>';

const API_URL = 'https://mzansiway-backend-production.up.railway.app';

// ============================================================
// BLD Pinned Master List v123 — 537 Available Products
// Source: Sandile Kunene, Blue Label Distribution
// Last updated: 2026-08-26
// ============================================================
const VOUCHER_CATEGORIES = [
  {
    id: 'ringas',
    name: 'Ringas',
    icon: '📱',
    color: '#E60000',
    section: 'airtime',
    groups: {
      'Airtime': [
        { name: 'Ringas R2', price: 2.0, validity: '30 Day', prodId: 1084, qaId: 1046 },
        { name: 'Ringas R5', price: 5.0, validity: '30 Day', prodId: 1085, qaId: 1047 },
        { name: 'Ringas R10', price: 10.0, validity: '30 Day', prodId: 1086, qaId: 1048 },
        { name: 'Ringas R12', price: 12.0, validity: '30 Day', prodId: 1087, qaId: 1049 },
        { name: 'Ringas R15', price: 15.0, validity: '30 Day', prodId: 1088, qaId: 1050 },
        { name: 'Ringas R20', price: 20.0, validity: '30 Day', prodId: 1089, qaId: 1051 },
        { name: 'Ringas R25', price: 25.0, validity: '30 Day', prodId: 1090, qaId: 1052 },
        { name: 'Ringas R29', price: 29.0, validity: '30 Day', prodId: 1091, qaId: 1053 },
        { name: 'Ringas R30', price: 30.0, validity: '30 Day', prodId: 1092, qaId: 1054 },
        { name: 'Ringas R35', price: 35.0, validity: '30 Day', prodId: 1093, qaId: 1055 },
        { name: 'Ringas R50', price: 50.0, validity: '30 Day', prodId: 1094, qaId: 1056 },
        { name: 'Ringas R55', price: 55.0, validity: '30 Day', prodId: 1095, qaId: 1057 },
        { name: 'Ringas R60', price: 60.0, validity: '30 Day', prodId: 1096, qaId: 1058 },
        { name: 'Ringas R70', price: 70.0, validity: '30 Day', prodId: 1097, qaId: 1059 },
        { name: 'Ringas R80', price: 80.0, validity: '30 Day', prodId: 1098, qaId: 1060 },
        { name: 'Ringas R100', price: 100.0, validity: '30 Day', prodId: 1099, qaId: 1061 },
        { name: 'Ringas R110', price: 110.0, validity: '30 Day', prodId: 1100, qaId: 1062 },
        { name: 'Ringas R150', price: 150.0, validity: '30 Day', prodId: 1101, qaId: 1063 },
        { name: 'Ringas R180', price: 180.0, validity: '30 Day', prodId: 1102, qaId: 1064 },
        { name: 'Ringas R200', price: 200.0, validity: '30 Day', prodId: 1103, qaId: 1065 },
        { name: 'Ringas R250', price: 250.0, validity: '30 Day', prodId: 1104, qaId: 1066 },
        { name: 'Ringas R275', price: 275.0, validity: '30 Day', prodId: 1105, qaId: 1067 },
        { name: 'Ringas R300', price: 300.0, validity: '30 Day', prodId: 1106, qaId: 1068 },
        { name: 'Ringas R500', price: 500.0, validity: '30 Day', prodId: 1107, qaId: 1069 },
        { name: 'Ringas R750', price: 750.0, validity: '30 Day', prodId: 1108, qaId: 1070 },
        { name: 'Ringas R1000', price: 1000.0, validity: '30 Day', prodId: 1109, qaId: 1071 },
      ],
    },
  },
  {
    id: 'cconnect',
    name: 'CConnect',
    icon: '📱',
    color: '#0077C8',
    section: 'airtime',
    groups: {
      'Airtime': [
        { name: 'CConnect R2', price: 2.0, validity: '3 years', prodId: 1110, qaId: 1072 },
        { name: 'CConnect R5', price: 5.0, validity: '3 years', prodId: 1111, qaId: 1073 },
        { name: 'CConnect R10', price: 10.0, validity: '3 years', prodId: 1112, qaId: 1074 },
        { name: 'CConnect R12', price: 12.0, validity: '3 years', prodId: 1113, qaId: 1075 },
        { name: 'CConnect R15', price: 15.0, validity: '3 years', prodId: 1114, qaId: 1076 },
        { name: 'CConnect R20', price: 20.0, validity: '3 years', prodId: 1115, qaId: 1077 },
        { name: 'CConnect R25', price: 25.0, validity: '3 years', prodId: 1116, qaId: 1078 },
        { name: 'CConnect R29', price: 29.0, validity: '3 years', prodId: 1117, qaId: 1079 },
        { name: 'CConnect R30', price: 30.0, validity: '3 years', prodId: 1118, qaId: 1080 },
        { name: 'CConnect R35', price: 35.0, validity: '3 years', prodId: 1119, qaId: 1081 },
        { name: 'CConnect R50', price: 50.0, validity: '3 years', prodId: 1120, qaId: 1082 },
        { name: 'CConnect R55', price: 55.0, validity: '3 years', prodId: 1121, qaId: 1083 },
        { name: 'CConnect R60', price: 60.0, validity: '3 years', prodId: 1122, qaId: 1084 },
        { name: 'CConnect R70', price: 70.0, validity: '3 years', prodId: 1123, qaId: 1085 },
        { name: 'CConnect R80', price: 80.0, validity: '3 years', prodId: 1124, qaId: 1086 },
        { name: 'CConnect R100', price: 100.0, validity: '3 years', prodId: 1125, qaId: 1087 },
        { name: 'CConnect R110', price: 110.0, validity: '3 years', prodId: 1126, qaId: 1088 },
        { name: 'CConnect R150', price: 150.0, validity: '3 years', prodId: 1127, qaId: 1089 },
        { name: 'CConnect R180', price: 180.0, validity: '3 years', prodId: 1128, qaId: 1090 },
        { name: 'CConnect R200', price: 200.0, validity: '3 years', prodId: 1129, qaId: 1091 },
        { name: 'CConnect R250', price: 250.0, validity: '3 years', prodId: 1130, qaId: 1092 },
        { name: 'CConnect R275', price: 275.0, validity: '3 years', prodId: 1131, qaId: 1093 },
        { name: 'CConnect R300', price: 300.0, validity: '3 years', prodId: 1132, qaId: 1094 },
        { name: 'CConnect R500', price: 500.0, validity: '3 years', prodId: 1133, qaId: 1095 },
        { name: 'CConnect R750', price: 750.0, validity: '3 years', prodId: 1134, qaId: 1096 },
        { name: 'CConnect R1000', price: 1000.0, validity: '3 years', prodId: 1135, qaId: 1097 },
      ],
    },
  },
  {
    id: 'vodacom',
    name: 'Vodacom',
    icon: '📶',
    color: '#E60000',
    section: 'data',
    groups: {
      'Airtime': [
        { name: 'Virtual Vodago R2', price: 2.0, validity: '30 Day', prodId: 95, qaId: 95 },
        { name: 'Virtual Vodago R5', price: 5.0, validity: '30 Day', prodId: 73, qaId: 73 },
        { name: 'Virtual Vodago R10', price: 10.0, validity: '30 Day', prodId: 96, qaId: 96 },
        { name: 'Virtual Vodago R12', price: 12.0, validity: '30 Day', prodId: 33, qaId: 33 },
        { name: 'Virtual Vodago R29', price: 29.0, validity: '30 Day', prodId: 2, qaId: 2 },
        { name: 'Virtual Vodago R49 150 SMS', price: 49.0, validity: '30 Day', prodId: 31, qaId: 1652 },
        { name: 'Virtual Vodago R55', price: 55.0, validity: '30 Day', prodId: 3, qaId: 3 },
        { name: 'Virtual Vodago R110', price: 110.0, validity: '30 Day', prodId: 4, qaId: 4 },
        { name: 'Virtual Vodago R275', price: 275.0, validity: '30 Day', prodId: 6, qaId: 6 },
      ],
      'Daily Bundles': [
        { name: 'Daily WhatsApp 50MB R3', price: 3.0, validity: '1 Day', prodId: 884, qaId: 935 },
        { name: 'Daily 200MB R5', price: 5.0, validity: '1 Day', prodId: 1543, qaId: 1639 },
        { name: 'Daily WhatsApp 250MB R5', price: 5.0, validity: '1 Day', prodId: 885, qaId: 936 },
        { name: 'Three Day WhatsApp 150MB R7', price: 7.0, validity: '3 Day', prodId: 1197, qaId: 1145 },
        { name: 'Daily On Net Voice 60 min R8', price: 8.0, validity: '1 Day', prodId: 1546, qaId: 1636 },
        { name: 'Daily 500MB R10', price: 10.0, validity: '1 Day', prodId: 1544, qaId: 1638 },
        { name: 'Daily On Net Voice 500 min R10', price: 10.0, validity: '1 Day', prodId: 1547, qaId: 1635 },
        { name: 'Daily Any Net Voice 500 min R15', price: 15.0, validity: '1 Day', prodId: 1548, qaId: 1634 },
        { name: 'Daily 3GB R32', price: 32.0, validity: '1 Day', prodId: 1545, qaId: 1637 },
      ],
      'Weekly Data': [
        { name: 'Weekly WhatsApp 300MB R13', price: 13.0, validity: '7 Day', prodId: 1196, qaId: 1144 },
        { name: 'Weekly WhatsApp 500MB R15', price: 15.0, validity: '7 Day', prodId: 1532, qaId: 1526 },
        { name: 'Weekly 175MB R19', price: 19.0, validity: '7 Day', prodId: 1506, qaId: 1492 },
        { name: 'Weekly Tiktok 1GB R25', price: 25.0, validity: '7 Day', prodId: 1533, qaId: 1527 },
        { name: 'Weekly YouTube 1GB R25', price: 25.0, validity: '7 Day', prodId: 1535, qaId: 1529 },
        { name: 'Weekly Facebook 1GB R25', price: 25.0, validity: '7 Day', prodId: 1530, qaId: 1531 },
        { name: 'Weekly 375MB R32', price: 32.0, validity: '7 Day', prodId: 1507, qaId: 1493 },
        { name: 'Weekly 750MB R55', price: 55.0, validity: '7 Day', prodId: 1508, qaId: 1494 },
        { name: 'Weekly 1.5GB R75', price: 75.0, validity: '7 Day', prodId: 1509, qaId: 1495 },
        { name: 'Weekly 3GB R110', price: 110.0, validity: '7 Day', prodId: 1510, qaId: 1496 },
        { name: '14 Day 2GB Anytime + 2GB NightOwl R49', price: 49.0, validity: '14 Day', prodId: 1585, qaId: 1709 },
      ],
      'Monthly Data': [
        { name: 'Monthly 120MB R15', price: 15.0, validity: '30 Day', prodId: 1512, qaId: 1498 },
        { name: 'Monthly 300MB R35', price: 35.0, validity: '30 Day', prodId: 1513, qaId: 1499 },
        { name: 'Monthly WhatsApp 1.2GB R37', price: 37.0, validity: '30 Day', prodId: 1195, qaId: 1143 },
        { name: 'Monthly Whatsapp 1.5GB R40', price: 40.0, validity: '30 Day', prodId: 1531, qaId: 1525 },
        { name: 'Monthly Tiktok 1GB R40', price: 40.0, validity: '30 Day', prodId: 1534, qaId: 1528 },
        { name: 'Monthly YouTube 1GB R40', price: 40.0, validity: '30 Day', prodId: 1536, qaId: 1530 },
        { name: 'Monthly Facebook 1GB R40', price: 40.0, validity: '30 Day', prodId: 1529, qaId: 1532 },
        { name: 'Monthly 500MB R55', price: 55.0, validity: '30 Day', prodId: 1514, qaId: 1500 },
        { name: 'Monthly 700MB R75', price: 75.0, validity: '30 Day', prodId: 1515, qaId: 1501 },
        { name: 'Monthly 5GB Anytime + 5 GB NightOwl R99', price: 99.0, validity: '30 Day', prodId: 1586, qaId: 1710 },
        { name: 'Monthly 1.5GB R95', price: 95.0, validity: '30 Day', prodId: 1516, qaId: 1502 },
        { name: 'Monthly 3GB R165', price: 165.0, validity: '30 Day', prodId: 1517, qaId: 1503 },
        { name: 'Monthly 10GB Anytime + 10GB NightOwl R149', price: 149.0, validity: '30 Day', prodId: 1587, qaId: 1711 },
        { name: 'Monthly 20GB Anytime + 20GB NightOwl R229', price: 229.0, validity: '30 Day', prodId: 1588, qaId: 1712 },
        { name: 'Monthly 6GB R275', price: 275.0, validity: '30 Day', prodId: 1518, qaId: 1504 },
        { name: 'Monthly 10GB R375', price: 375.0, validity: '30 Day', prodId: 1519, qaId: 1505 },
        { name: 'Monthly 50GB + 50GB NightOwl R379', price: 379.0, validity: '30 Day', prodId: 1576, qaId: 1701 },
        { name: 'Monthly 100GB + 100GB NightOwl R479', price: 479.0, validity: '30 Day', prodId: 1577, qaId: 1702 },
        { name: 'Monthly 20GB R499', price: 499.0, validity: '30 Day', prodId: 1192, qaId: 1140 },
        { name: 'Weekly 7.5GB R220', price: 220.0, validity: '7 Day', prodId: 1511, qaId: 1497 },
        { name: 'Monthly 60GB R699', price: 699.0, validity: '30 Day', prodId: 1520, qaId: 1506 },
        { name: 'Monthly 120GB R899', price: 899.0, validity: '30 Day', prodId: 1521, qaId: 1507 },
      ],
    },
  },
  {
    id: 'mtn',
    name: 'MTN',
    icon: '📶',
    color: '#FFCB05',
    section: 'data',
    groups: {
      'Airtime': [
        { name: 'Virtual MTN R2', price: 2.0, validity: '30 Day', prodId: 49, qaId: 49 },
        { name: 'Virtual MTN R5', price: 5.0, validity: '30 Day', prodId: 52, qaId: 52 },
        { name: 'Virtual MTN R10', price: 10.0, validity: '30 Day', prodId: 53, qaId: 53 },
        { name: 'Virtual MTN R15', price: 15.0, validity: '30 Day', prodId: 35, qaId: 35 },
        { name: 'Virtual MTN R20', price: 20.0, validity: '30 Day', prodId: 780, qaId: 852 },
        { name: 'Virtual MTN R30', price: 30.0, validity: '30 Day', prodId: 7, qaId: 7 },
        { name: 'Virtual MTN R50', price: 50.0, validity: '30 Day', prodId: 888, qaId: 939 },
        { name: 'Virtual MTN R60', price: 60.0, validity: '30 Day', prodId: 8, qaId: 8 },
        { name: 'Virtual MTN R100', price: 100.0, validity: '30 Day', prodId: 517, qaId: 631 },
        { name: 'Virtual MTN R129', price: 129.0, validity: '30 Day', prodId: 781, qaId: 853 },
        { name: 'Virtual MTN R149', price: 149.0, validity: '30 Day', prodId: 782, qaId: 854 },
        { name: 'Virtual MTN R180', price: 180.0, validity: '30 Day', prodId: 9, qaId: 9 },
      ],
      'Hourly Data': [
        { name: 'Hourly Data 35MB R3.50', price: 3.5, validity: 'Hourly', prodId: 1212, qaId: 1159 },
        { name: 'Hourly Data 150MB R8', price: 8.0, validity: 'Hourly', prodId: 1368, qaId: 1350 },
        { name: 'Hourly Data 500MB R9', price: 9.0, validity: 'Hourly', prodId: 1214, qaId: 1161 },
        { name: '3 Hour Data 350MB R11', price: 11.0, validity: 'Hourly', prodId: 1361, qaId: 1340 },
        { name: 'Hourly Rush Hour 1GB R12', price: 12.0, validity: 'Hourly', prodId: 666, qaId: 773 },
      ],
      'Daily Data': [
        { name: 'Daily Whatsapp 50MB R3', price: 3.0, validity: '1 Day', prodId: 1232, qaId: 1179 },
        { name: 'Daily Social Pass 50MB R3.50', price: 3.5, validity: '1 Day', prodId: 1357, qaId: 1335 },
        { name: 'Daily On-Net Voice 55min R5', price: 5.0, validity: '1 Day', prodId: 644, qaId: 751 },
        { name: 'Daily WhatsApp 250MB R5', price: 5.0, validity: '1 Day', prodId: 1352, qaId: 1349 },
        { name: 'Daily Facebook 200MB R5', price: 5.0, validity: '1 Day', prodId: 536, qaId: 650 },
        { name: 'Daily Data 35MB R6', price: 6.0, validity: 'Daily', prodId: 1366, qaId: 1352 },
        { name: 'Daily Whatsapp 400MB R7', price: 7.0, validity: '1 Day', prodId: 1233, qaId: 1180 },
        { name: 'Monthly 30 SMS R8', price: 8.0, validity: '30 Day', prodId: 1369, qaId: 1361 },
        { name: 'Hourly Data 150MB R8', price: 8.0, validity: 'Hourly', prodId: 1368, qaId: 1350 },
        { name: 'Daily Whatsapp 1GB R10', price: 10.0, validity: '1 Day', prodId: 1297, qaId: 821 },
        { name: 'Daily All-Net Voice 30min R10', price: 10.0, validity: '1 Day', prodId: 1000, qaId: 1036 },
        { name: 'MyTown Unlimited All-Net Voice R10', price: 10.0, validity: '24 hours', prodId: 1578, qaId: 1703 },
        { name: 'Daily Data 100MB R11', price: 11.0, validity: '1 Day', prodId: 1216, qaId: 1163 },
        { name: 'Daily All-Net Voice 60min R12', price: 12.0, validity: '1 Day', prodId: 1001, qaId: 1037 },
        { name: 'Daily All-Net Voice 120min R20', price: 20.0, validity: '1 Day', prodId: 1002, qaId: 1038 },
        { name: 'Daily Data 250MB R17', price: 17.0, validity: '1 Day', prodId: 1217, qaId: 1164 },
        { name: 'Daily Data 600MB R22', price: 22.0, validity: '1 Day', prodId: 1362, qaId: 1341 },
        { name: 'Daily Data 1.5GB R33', price: 33.0, validity: 'Daily', prodId: 1371, qaId: 1353 },
        { name: 'Daily EveryDayGigs 1.5GB R32', price: 32.0, validity: '1 Day', prodId: 1302, qaId: 1266 },
      ],
      'Weekly Data': [
        { name: 'Weekly Social Pass 250MB R10', price: 10.0, validity: '7 Day', prodId: 1358, qaId: 1336 },
        { name: 'Weekly Facebook 300MB R10', price: 10.0, validity: '7 Day', prodId: 825, qaId: 891 },
        { name: 'Weekly Whatsapp 300MB R12', price: 12.0, validity: '7 Day', prodId: 1235, qaId: 1182 },
        { name: 'Weekly Whatsapp 300MB Voice+ R13', price: 13.0, validity: '7 Day', prodId: 1572, qaId: 1697 },
        { name: 'Weekly Data 80MB R15', price: 15.0, validity: '7 Day', prodId: 1220, qaId: 1167 },
        { name: 'Weekly WhatsApp 550MB Voice+ R15', price: 15.0, validity: '7 Day', prodId: 1573, qaId: 1698 },
        { name: 'Weekly Data 150MB R18', price: 18.0, validity: '7 Day', prodId: 1221, qaId: 1168 },
        { name: 'Weekly Whatsapp 1GB Voice+ R22', price: 22.0, validity: '7 Day', prodId: 1574, qaId: 1699 },
        { name: 'Weekly TikTok 1GB R25', price: 25.0, validity: '7 Day', prodId: 1298, qaId: 1262 },
        { name: 'Weekly Facebook 1GB R25', price: 25.0, validity: '7 Day', prodId: 1240, qaId: 1187 },
        { name: 'Weekly Data 250MB R30', price: 30.0, validity: '7 Day', prodId: 1370, qaId: 1354 },
        { name: 'Weekly TikTok 2GB R30', price: 30.0, validity: '7 Day', prodId: 1299, qaId: 842 },
        { name: 'Weekly Facebook 2GB R30', price: 30.0, validity: '7 Day', prodId: 1300, qaId: 840 },
        { name: 'Weekly All-Net Voice 70min R30', price: 30.0, validity: '7 Day', prodId: 632, qaId: 739 },
        { name: 'Weekly Unlimited WhatsApp R35', price: 35.0, validity: '7 Day', prodId: 1355, qaId: 1333 },
        { name: 'Seven Day EveryDayGigs 3.5GB R59', price: 59.0, validity: '7 Day', prodId: 1372, qaId: 1356 },
        { name: 'Weekly Data 1.2GB R69', price: 69.0, validity: '7 Day', prodId: 1223, qaId: 1170 },
        { name: 'Seven Day EveryDayGigs 7GB R100', price: 100.0, validity: '7 Day', prodId: 1374, qaId: 1357 },
        { name: 'Weekly Data 2.5GB R105', price: 105.0, validity: '7 Day', prodId: 1224, qaId: 1171 },
        { name: 'Weekly Data 6GB R210', price: 210.0, validity: '7 Day', prodId: 1225, qaId: 1172 },
        { name: '14 Days 3GB Anytime + 3GB Night R49', price: 49.0, validity: '14 Days', prodId: 1553, qaId: 1677 },
        { name: '3 Day Whatsapp 150MB R7', price: 7.0, validity: '3 Day', prodId: 1234, qaId: 1181 },
        { name: 'Three Day Whatsapp 1GB R12', price: 12.0, validity: '3 Day', prodId: 823, qaId: 889 },
        { name: '3 Day Data 500MB R29', price: 29.0, validity: '3 Day', prodId: 1363, qaId: 1342 },
        { name: 'Three Day Data 1.5GB R42.50', price: 42.5, validity: '3 Day', prodId: 1219, qaId: 1166 },
        { name: '3 Day Combo 2GB + 40 Min All-Net R39', price: 39.0, validity: '3 Day', prodId: 1359, qaId: 1337 },
        { name: '3 Day Combo 3GB + 60 Min All-Net R49', price: 49.0, validity: '3 Day', prodId: 1360, qaId: 1339 },
        { name: '20 Day Whatsapp 1GB R33', price: 33.0, validity: '20 Day', prodId: 1237, qaId: 1184 },
      ],
      'Monthly Data': [
        { name: 'Monthly Data 65MB R12', price: 12.0, validity: '30 Day', prodId: 1293, qaId: 1255 },
        { name: 'Monthly 100 SMS R25', price: 25.0, validity: '30 Day', prodId: 1292, qaId: 1268 },
        { name: 'Monthly Data 120MB R20', price: 20.0, validity: '30 Day', prodId: 548, qaId: 662 },
        { name: 'Monthly WhatsApp 700MB R29', price: 29.0, validity: '30 Day', prodId: 1356, qaId: 1334 },
        { name: 'Monthly Data 220MB R30', price: 30.0, validity: '30 Day', prodId: 1226, qaId: 1173 },
        { name: 'Monthly Whatsapp 1.2GB Voice+ R37', price: 37.0, validity: '30 Day', prodId: 1575, qaId: 1700 },
        { name: 'Monthly Facebook 1GB R40', price: 40.0, validity: '30 Day', prodId: 1301, qaId: 1265 },
        { name: 'Monthly On-Net Voice 350min R50', price: 50.0, validity: '30 Day', prodId: 650, qaId: 757 },
        { name: 'Monthly Data 420MB R55', price: 55.0, validity: '30 Day', prodId: 1294, qaId: 1257 },
        { name: 'Monthly Whatsapp 2GB R55', price: 55.0, validity: '30 Day', prodId: 1239, qaId: 1186 },
        { name: 'Monthly Data 600MB R75', price: 75.0, validity: '30 Day', prodId: 1295, qaId: 1259 },
        { name: 'Monthly Data 1GB R80', price: 80.0, validity: '30 Day', prodId: 1373, qaId: 1355 },
        { name: 'Monthly Data 1.2GB R89', price: 89.0, validity: '30 Day', prodId: 1227, qaId: 1174 },
        { name: 'Monthly 1.5GB R99', price: 99.0, validity: '30 Day', prodId: 735, qaId: 1521 },
        { name: 'Monthly On-Net Voice 900min R100', price: 100.0, validity: '30 Day', prodId: 989, qaId: 1025 },
        { name: 'Weekly All-Net Voice 600min R150', price: 150.0, validity: '7 Day', prodId: 636, qaId: 743 },
        { name: 'Monthly Data 2.5GB + 2.5GB R155', price: 155.0, validity: '30 Day', prodId: 1228, qaId: 1175 },
        { name: 'Monthly Thirty Day EveryDayGigs 15GB R170', price: 170.0, validity: '30 Day', prodId: 1375, qaId: 1358 },
        { name: 'Monthly 10GB Anytime + 10GB Night R149', price: 149.0, validity: '30 Days', prodId: 1554, qaId: 1678 },
        { name: 'Monthly Data 3.5GB + 3.5GB R215', price: 215.0, validity: '30 Day', prodId: 1229, qaId: 1176 },
        { name: 'Monthly Super Data 30GB R269', price: 269.0, validity: '30 Day', prodId: 1209, qaId: 1156 },
        { name: 'Monthly Data 5.5GB + 5.5GB R299', price: 299.0, validity: '30 Day', prodId: 1230, qaId: 1177 },
        { name: 'Thirty Day EveryDayGigs 30GB R299', price: 299.0, validity: '30 Day', prodId: 873, qaId: 924 },
        { name: 'Monthly Data 7GB+7GB R365', price: 365.0, validity: '30 Day', prodId: 1296, qaId: 1260 },
        { name: 'Thirty Day EveryDayGigs 60GB R399', price: 399.0, validity: '30 Day', prodId: 874, qaId: 925 },
        { name: 'Monthly Super Data 70GB R419', price: 419.0, validity: '30 Day', prodId: 1570, qaId: 1695 },
        { name: 'Monthly 12GB + 12GB R499', price: 499.0, validity: '30 Day', prodId: 1231, qaId: 1178 },
        { name: 'Monthly Super Data 200GB R549', price: 549.0, validity: '30 Day', prodId: 1571, qaId: 1696 },
        { name: 'Monthly 20GB+20GB R599', price: 599.0, validity: '30 Day', prodId: 741, qaId: 848 },
        { name: 'Monthly Data 40GB+40GB R720', price: 720.0, validity: '30 Day', prodId: 1376, qaId: 1362 },
        { name: 'Monthly Data 60GB+60GB R800', price: 800.0, validity: '30 Day', prodId: 1377, qaId: 1363 },
      ],
    },
  },
  {
    id: 'cell_c',
    name: 'Cell C',
    icon: '📶',
    color: '#333333',
    section: 'data',
    groups: {
      'Airtime': [
        { name: 'Virtual Cell C R5', price: 5.0, validity: 'No Expiry', prodId: 30, qaId: 30 },
        { name: 'Virtual Cell C R10', price: 10.0, validity: 'No Expiry', prodId: 58, qaId: 58 },
        { name: 'Virtual Cell C R25', price: 25.0, validity: 'No Expiry', prodId: 16, qaId: 16 },
        { name: 'Virtual Cell C R35', price: 35.0, validity: 'No Expiry', prodId: 18, qaId: 18 },
        { name: 'Virtual Cell C R50', price: 50.0, validity: 'No Expiry', prodId: 21, qaId: 21 },
        { name: 'Virtual Cell C R70', price: 70.0, validity: 'No Expiry', prodId: 22, qaId: 22 },
        { name: 'Virtual Cell C R100', price: 100.0, validity: 'No Expiry', prodId: 161, qaId: 161 },
        { name: 'Virtual Cell C R150', price: 150.0, validity: 'No Expiry', prodId: 23, qaId: 23 },
        { name: 'Virtual Cell C R200', price: 200.0, validity: 'No Expiry', prodId: 162, qaId: 162 },
        { name: 'Virtual Cell C R300', price: 300.0, validity: 'No Expiry', prodId: 122, qaId: 122 },
        { name: 'Virtual Cell C R500', price: 500.0, validity: 'No Expiry', prodId: 124, qaId: 124 },
        { name: 'Virtual Cell C R20 Supacharge', price: 20.0, validity: 'No Expiry', prodId: 218, qaId: 218 },
        { name: 'Virtual Cell C R30 Supacharge', price: 30.0, validity: 'No Expiry', prodId: 219, qaId: 219 },
        { name: 'Virtual Cell C R60 Supacharge', price: 60.0, validity: 'No Expiry', prodId: 220, qaId: 220 },
        { name: 'Virtual Cell C R120 Supacharge', price: 120.0, validity: 'No Expiry', prodId: 221, qaId: 221 },
        { name: 'Virtual Cell C R39 100 SMS', price: 39.0, validity: '120 Day', prodId: 19, qaId: 19 },
      ],
      'Voice': [
        { name: 'Daily Voice 10min R5', price: 5.0, validity: '1 Day', prodId: 892, qaId: 943 },
        { name: 'Daily Voice 20min R9', price: 9.0, validity: '1 Day', prodId: 893, qaId: 946 },
        { name: 'Weekly Voice 15min R10', price: 10.0, validity: '7 Day', prodId: 896, qaId: 949 },
        { name: 'Weekly Voice 35min R19', price: 19.0, validity: '7 Day', prodId: 897, qaId: 950 },
        { name: 'Daily Voice 60min R19', price: 19.0, validity: '1 Day', prodId: 894, qaId: 947 },
        { name: 'Monthly Voice 30min R20', price: 20.0, validity: '30 Day', prodId: 1156, qaId: 1127 },
        { name: 'Weekly Voice 50min R25', price: 25.0, validity: '7 Day', prodId: 898, qaId: 951 },
        { name: 'Daily Voice 100min R29', price: 29.0, validity: '1 Day', prodId: 895, qaId: 948 },
        { name: 'Weekly Voice 100min R39', price: 39.0, validity: '7 Day', prodId: 899, qaId: 952 },
        { name: 'Weekly Voice 150min R50', price: 50.0, validity: '7 Day', prodId: 1154, qaId: 1125 },
        { name: 'Monthly Voice 90min R50', price: 50.0, validity: '30 Day', prodId: 902, qaId: 955 },
        { name: 'Weekly Voice 200min R69', price: 69.0, validity: '7 Day', prodId: 900, qaId: 953 },
        { name: 'Monthly Voice 240min R99', price: 99.0, validity: '30 Day', prodId: 903, qaId: 956 },
        { name: 'Weekly Voice 500min R100', price: 100.0, validity: '7 Day', prodId: 1155, qaId: 1126 },
        { name: 'Monthly Voice 400min R135', price: 135.0, validity: '30 Day', prodId: 1157, qaId: 1128 },
        { name: 'Monthly Voice 1000min R229', price: 229.0, validity: '30 Day', prodId: 904, qaId: 957 },
      ],
      'Daily Data': [
        { name: 'Daily Data 30MB R5', price: 5.0, validity: '1 Day', prodId: 905, qaId: 958 },
        { name: 'Daily Facebook 250MB R5', price: 5.0, validity: '1 Day', prodId: 1033, qaId: 1070 },
        { name: 'Daily Instagram 250MB R5', price: 5.0, validity: '1 Day', prodId: 1032, qaId: 1069 },
        { name: 'Daily TikTok 250MB R5', price: 5.0, validity: '1 Day', prodId: 1031, qaId: 1068 },
        { name: 'Daily YouTube 250MB R5', price: 5.0, validity: '1 Day', prodId: 1030, qaId: 1067 },
        { name: 'All-In-One+ Daily 90MB R5', price: 5.0, validity: '1 Day', prodId: 957, qaId: 993 },
        { name: '50 MB SmartData R7.50', price: 7.5, validity: '1 Day', prodId: 199, qaId: 199 },
        { name: 'Daily Data 80MB R10', price: 10.0, validity: '1 Day', prodId: 906, qaId: 959 },
        { name: 'All-In-One+ Daily 150MB R10', price: 10.0, validity: '1 Day', prodId: 958, qaId: 994 },
        { name: 'Daily Facebook 500MB R9', price: 9.0, validity: '1 Day', prodId: 1037, qaId: 1010 },
        { name: 'Daily Instagram 500MB R9', price: 9.0, validity: '1 Day', prodId: 1036, qaId: 1009 },
        { name: 'Daily TikTok 500MB R9', price: 9.0, validity: '1 Day', prodId: 1035, qaId: 1008 },
        { name: 'Daily YouTube 500MB R9', price: 9.0, validity: '1 Day', prodId: 1034, qaId: 1071 },
        { name: 'Daily Data 150MB R15', price: 15.0, validity: '1 Day', prodId: 907, qaId: 960 },
        { name: 'Daily Data 300MB R17', price: 17.0, validity: '1 Day', prodId: 473, qaId: 573 },
        { name: 'Daily Data 600MB R19', price: 19.0, validity: '1 Day', prodId: 908, qaId: 961 },
        { name: 'All-In-One+ Daily 450MB R20', price: 20.0, validity: '1 Day', prodId: 959, qaId: 995 },
        { name: 'Daily Data 1GB R25', price: 25.0, validity: '1 Day', prodId: 909, qaId: 962 },
        { name: 'Daily Data 2GB R35', price: 35.0, validity: '1 Day', prodId: 910, qaId: 963 },
      ],
      'Weekly Data': [
        { name: 'Weekly Facebook 100MB R5', price: 5.0, validity: '7 Day', prodId: 1041, qaId: 1014 },
        { name: 'Weekly Instagram 100MB R5', price: 5.0, validity: '7 Day', prodId: 1040, qaId: 1013 },
        { name: 'Weekly TikTok 100MB R5', price: 5.0, validity: '7 Day', prodId: 1039, qaId: 1012 },
        { name: 'Weekly YouTube 100MB R5', price: 5.0, validity: '7 Day', prodId: 1038, qaId: 1011 },
        { name: 'Weekly Data 60MB R10', price: 10.0, validity: '7 Day', prodId: 589, qaId: 706 },
        { name: 'Weekly Facebook 350MB R10', price: 10.0, validity: '7 Day', prodId: 1045, qaId: 1018 },
        { name: 'Weekly Instagram 350MB R10', price: 10.0, validity: '7 Day', prodId: 1044, qaId: 1017 },
        { name: 'Weekly TikTok 350MB R10', price: 10.0, validity: '7 Day', prodId: 1043, qaId: 1016 },
        { name: 'Weekly YouTube 350MB R10', price: 10.0, validity: '7 Day', prodId: 1042, qaId: 1015 },
        { name: 'WhatsApp Voucher R10 300MB', price: 10.0, validity: '3 Day', prodId: 889, qaId: 940 },
        { name: 'WhatsApp Voucher R15 500MB', price: 15.0, validity: '7 Day', prodId: 890, qaId: 941 },
        { name: 'Weekly Data 150MB R19', price: 19.0, validity: '7 Day', prodId: 911, qaId: 964 },
        { name: 'Weekly YouTube 1GB R19', price: 19.0, validity: '7 Day', prodId: 1049, qaId: 1022 },
        { name: 'Weekly Instagram 1GB R19', price: 19.0, validity: '7 Day', prodId: 1048, qaId: 1021 },
        { name: 'Weekly TikTok 1GB R19', price: 19.0, validity: '7 Day', prodId: 1047, qaId: 1020 },
        { name: 'Weekly Facebook 1GB R19', price: 19.0, validity: '7 Day', prodId: 1046, qaId: 1019 },
        { name: 'WhatsApp Voucher R20 600MB', price: 20.0, validity: '15 Day', prodId: 575, qaId: 691 },
        { name: 'All-In-One+ Weekly 300MB R20', price: 20.0, validity: '7 Day', prodId: 960, qaId: 996 },
        { name: 'Weekly Data 250MB R29', price: 29.0, validity: '7 Day', prodId: 912, qaId: 965 },
        { name: 'Monthly Facebook 500MB R19', price: 19.0, validity: '30 Day', prodId: 1053, qaId: 1026 },
        { name: 'Monthly Instagram 500MB R19', price: 19.0, validity: '30 Day', prodId: 1052, qaId: 1025 },
        { name: 'Monthly TikTok 500MB R19', price: 19.0, validity: '30 Day', prodId: 1051, qaId: 1024 },
        { name: 'Monthly YouTube 500MB R19', price: 19.0, validity: '30 Day', prodId: 1050, qaId: 1023 },
        { name: 'Weekly Data 500MB R49', price: 49.0, validity: '7 Day', prodId: 913, qaId: 966 },
        { name: 'All-In-One+ Weekly 1GB R49', price: 49.0, validity: '7 Day', prodId: 961, qaId: 997 },
        { name: 'Weekly Data 1GB R69', price: 69.0, validity: '7 Day', prodId: 914, qaId: 967 },
        { name: 'All-In-One+ Weekly 3GB R79', price: 79.0, validity: '7 Day', prodId: 963, qaId: 999 },
        { name: 'Weekly Data 2GB R99', price: 99.0, validity: '7 Day', prodId: 915, qaId: 968 },
        { name: 'All-In-One+ Weekly 6GB R129', price: 129.0, validity: '7 Day', prodId: 965, qaId: 1001 },
      ],
      'Monthly Data': [
        { name: 'Monthly Data 100MB R19', price: 19.0, validity: '30 Day', prodId: 916, qaId: 969 },
        { name: 'Monthly Facebook 1GB R29', price: 29.0, validity: '30 Day', prodId: 1057, qaId: 1030 },
        { name: 'Monthly Instagram 1GB R29', price: 29.0, validity: '30 Day', prodId: 1056, qaId: 1029 },
        { name: 'Monthly TikTok 1GB R29', price: 29.0, validity: '30 Day', prodId: 1055, qaId: 1028 },
        { name: 'Monthly YouTube 1GB R29', price: 29.0, validity: '30 Day', prodId: 1054, qaId: 1027 },
        { name: 'Monthly Whatsapp 1GB R29', price: 29.0, validity: '30 Day', prodId: 481, qaId: 581 },
        { name: 'Monthly Data 150MB R29', price: 29.0, validity: '30 Day', prodId: 584, qaId: 700 },
        { name: 'Monthly Data 250MB R35', price: 35.0, validity: '30 Day', prodId: 585, qaId: 701 },
        { name: 'All in One 300MB', price: 35.0, validity: '14 Day', prodId: 566, qaId: 680 },
        { name: 'Monthly Facebook 2.5GB R49', price: 49.0, validity: '30 Day', prodId: 1061, qaId: 1098 },
        { name: 'Monthly Instagram 2.5GB R49', price: 49.0, validity: '30 Day', prodId: 1060, qaId: 1033 },
        { name: 'Monthly TikTok 2.5GB R49', price: 49.0, validity: '30 Day', prodId: 1059, qaId: 1032 },
        { name: 'Monthly YouTube 2.5GB R49', price: 49.0, validity: '30 Day', prodId: 1058, qaId: 1031 },
        { name: 'All-In-One+ Monthly 1GB R50', price: 50.0, validity: '30 Day', prodId: 962, qaId: 998 },
        { name: 'Monthly Data 350MB R49', price: 49.0, validity: '30 Day', prodId: 917, qaId: 970 },
        { name: 'Monthly Data 600MB R69', price: 69.0, validity: '30 Day', prodId: 918, qaId: 971 },
        { name: 'Monthly Data 1GB R85', price: 85.0, validity: '30 Day', prodId: 852, qaId: 917 },
        { name: 'All in One 1GB', price: 95.0, validity: '30 Day', prodId: 567, qaId: 681 },
        { name: 'Monthly Data 1.5GB R99', price: 99.0, validity: '30 Day', prodId: 853, qaId: 918 },
        { name: 'All-In-One+ Monthly 2GB R99', price: 99.0, validity: '30 Day', prodId: 964, qaId: 1000 },
        { name: 'Monthly Data 2GB R149', price: 149.0, validity: '30 Day', prodId: 919, qaId: 972 },
        { name: 'All-In-One+ Monthly 3GB R149', price: 149.0, validity: '30 Day', prodId: 966, qaId: 1002 },
        { name: 'Monthly Data 3GB R199', price: 199.0, validity: '30 Day', prodId: 920, qaId: 973 },
        { name: 'All in One 2.5GB', price: 195.0, validity: '30 Day', prodId: 568, qaId: 682 },
        { name: 'Monthly Data 6GB R299', price: 299.0, validity: '30 Day', prodId: 921, qaId: 974 },
        { name: 'All in One 5GB', price: 359.0, validity: '30 Day', prodId: 725, qaId: 832 },
        { name: 'Monthly Data 10GB R469', price: 469.0, validity: '30 Day', prodId: 922, qaId: 975 },
        { name: 'Monthly Data 40GB R489', price: 489.0, validity: '30 Day', prodId: 923, qaId: 976 },
        { name: 'All in One 10GB', price: 669.0, validity: '30 Day', prodId: 726, qaId: 833 },
      ],
      'Bundles': [
        { name: 'Home Connecta Flexi 2GB+2GB R45', price: 45.0, validity: '14 Day', prodId: 880, qaId: 931 },
        { name: 'Home Connecta Flexi 4GB+40min R59', price: 59.0, validity: '30 Day', prodId: 879, qaId: 930 },
        { name: 'Seven Day DayByDay 1GB R89', price: 89.0, validity: '7 Day', prodId: 876, qaId: 927 },
        { name: 'Thirty Day DayByDay 250MB R99', price: 99.0, validity: '30 Day', prodId: 877, qaId: 928 },
        { name: 'Home Connecta Flexi 10GB+60min R99', price: 99.0, validity: '30 Day', prodId: 841, qaId: 907 },
        { name: 'Home Connecta Flexi 10GB+10GB R149', price: 149.0, validity: '30 Day', prodId: 925, qaId: 978 },
        { name: 'Thirty Day DayByDay 500MB R169', price: 169.0, validity: '30 Day', prodId: 891, qaId: 942 },
        { name: 'Home Connecta Flexi 20GB+90min R199', price: 199.0, validity: '30 Day', prodId: 842, qaId: 908 },
        { name: 'Thirty Day DayByDay 1GB R299', price: 299.0, validity: '30 Day', prodId: 878, qaId: 929 },
        { name: 'Cell C R299 3GB Data 365 Day', price: 299.0, validity: '365 Day', prodId: 213, qaId: 213 },
        { name: 'Cell C R549 50GB+50GB 180 Day', price: 549.0, validity: '180 Day', prodId: 926, qaId: 979 },
        { name: 'Cell C R899 100GB+100GB 180 Day', price: 899.0, validity: '180 Day', prodId: 729, qaId: 836 },
        { name: 'Cell C R999 Infinite', price: 999.0, validity: '30 Day', prodId: 201, qaId: 201 },
      ],
    },
  },
  {
    id: 'telkom',
    name: 'Telkom',
    icon: '📶',
    color: '#0077C8',
    section: 'data',
    groups: {
      'Airtime': [
        { name: 'Airtime R5', price: 5.0, validity: '30 Day', prodId: 112, qaId: 107 },
        { name: 'Airtime R10', price: 10.0, validity: '30 Day', prodId: 113, qaId: 108 },
        { name: 'Airtime R20', price: 20.0, validity: '30 Day', prodId: 114, qaId: 109 },
        { name: 'Airtime R30', price: 30.0, validity: '30 Day', prodId: 115, qaId: 110 },
        { name: 'Airtime R50', price: 50.0, validity: '30 Day', prodId: 116, qaId: 111 },
        { name: 'Airtime R100', price: 100.0, validity: '30 Day', prodId: 117, qaId: 112 },
        { name: 'Airtime R250', price: 250.0, validity: '30 Day', prodId: 118, qaId: 113 },
        { name: 'Airtime R500', price: 500.0, validity: '30 Day', prodId: 235, qaId: 235 },
        { name: 'Airtime R1000', price: 1000.0, validity: '30 Day', prodId: 236, qaId: 236 },
      ],
      'Daily Bundles': [
        { name: 'Daily Social 25MB R3', price: 3.0, validity: '1 Day', prodId: 1384, qaId: 1405 },
        { name: 'Daily Social 50MB R4', price: 4.0, validity: '1 Day', prodId: 1385, qaId: 1406 },
        { name: 'Daily Social 75MB R5', price: 5.0, validity: '1 Day', prodId: 1386, qaId: 1407 },
        { name: 'Daily 30MB R5.50', price: 5.5, validity: '1 Day', prodId: 1461, qaId: 1482 },
        { name: 'Daily WhatsApp 150MB R6', price: 6.0, validity: '1 Day', prodId: 1387, qaId: 1408 },
        { name: 'Daily Social 100MB R6', price: 6.0, validity: '1 Day', prodId: 1388, qaId: 1409 },
        { name: 'Daily TikTok 150MB R6', price: 6.0, validity: '1 Day', prodId: 1456, qaId: 1475 },
        { name: '3 day 175MB Whatsapp Bundle R7', price: 7.0, validity: '3 Day', prodId: 1540, qaId: 1533 },
        { name: 'Daily WhatsApp Unlimited R15', price: 15.0, validity: '1 Day', prodId: 929, qaId: 982 },
        { name: 'Daily Social 250MB R12', price: 12.0, validity: '1 Day', prodId: 1393, qaId: 1414 },
        { name: 'Daily WhatsApp 300MB R11', price: 11.0, validity: '1 Day', prodId: 1394, qaId: 1415 },
        { name: 'Daily TikTok 300MB R11', price: 11.0, validity: '1 Day', prodId: 1457, qaId: 1476 },
        { name: 'Daily 150MB R12', price: 12.0, validity: '1 Day', prodId: 1426, qaId: 1447 },
        { name: 'Daily Whatsapp 300MB +10min All Net Voice R15', price: 15.0, validity: '1 Day', prodId: 1557, qaId: 1684 },
        { name: 'Daily Unlimited Whatsapp + 10min All Net Voice R17', price: 17.0, validity: '1 Day', prodId: 1558, qaId: 1685 },
        { name: 'Daily Social 500MB R17', price: 17.0, validity: '1 Day', prodId: 1412, qaId: 1433 },
        { name: 'Daily 500MB R16', price: 16.0, validity: '1 Day', prodId: 1401, qaId: 1422 },
        { name: 'Daily 300MB R21', price: 21.0, validity: '1 Day', prodId: 1462, qaId: 1483 },
        { name: 'Daily 1GB R31', price: 31.0, validity: '1 Day', prodId: 1425, qaId: 1446 },
        { name: 'Daily 2GB R52', price: 52.0, validity: '1 Day', prodId: 1439, qaId: 1459 },
      ],
      'Weekly Bundles': [
        { name: 'Weekly 50MB R6', price: 6.0, validity: '7 Day', prodId: 1463, qaId: 1484 },
        { name: 'Weekly Social 75MB R6', price: 6.0, validity: '7 Day', prodId: 1389, qaId: 1410 },
        { name: 'Weekly Chat 100MB R10', price: 10.0, validity: '7 Day', prodId: 1391, qaId: 1412 },
        { name: 'Weekly Social 100MB R10', price: 10.0, validity: '7 Day', prodId: 1392, qaId: 1413 },
        { name: 'Weekend TikTok 250MB R11', price: 11.0, validity: 'Sat & Sun', prodId: 1397, qaId: 1418 },
        { name: 'Weekly Social 250MB R11', price: 11.0, validity: '7 Day', prodId: 1398, qaId: 1419 },
        { name: 'Weekly Chat 250MB R12', price: 12.0, validity: '7 Day', prodId: 1395, qaId: 1416 },
        { name: 'Weekly WhatsApp 300MB R12', price: 12.0, validity: '7 Day', prodId: 1396, qaId: 1417 },
        { name: 'Weekend 100MB R12', price: 12.0, validity: 'Weekend', prodId: 1424, qaId: 1445 },
        { name: 'Weekly TikTok 300MB R15', price: 15.0, validity: '7 Day', prodId: 1458, qaId: 1477 },
        { name: 'Weekly 100MB R16', price: 16.0, validity: '7 Day', prodId: 1464, qaId: 1485 },
        { name: 'Monthly Social 250MB R17', price: 17.0, validity: '30 Day', prodId: 1413, qaId: 1434 },
        { name: 'Weekly Chat 500MB R19', price: 19.0, validity: '7 Day', prodId: 1414, qaId: 1435 },
        { name: 'Weekend 200MB R20', price: 20.0, validity: 'Weekend', prodId: 1430, qaId: 1451 },
        { name: 'Weekly FreeMe 200MB R20', price: 20.0, validity: '7 Day', prodId: 1415, qaId: 1436 },
        { name: 'Weekly Social 500MB R20', price: 20.0, validity: '7 Day', prodId: 1416, qaId: 1437 },
        { name: 'Weekly WhatsApp 750MB R21', price: 21.0, validity: '7 Day', prodId: 1422, qaId: 1443 },
        { name: 'Weekly TikTok 600MB R22', price: 22.0, validity: '7 Day', prodId: 1459, qaId: 1478 },
        { name: 'All Networks Data 150MB + 150MB R27', price: 27.0, validity: '180 Day', prodId: 1522, qaId: 1511 },
        { name: 'Weekend 500MB R31', price: 31.0, validity: 'Weekend', prodId: 1435, qaId: 1455 },
        { name: 'Weekly 250MB R32', price: 32.0, validity: '7 Day', prodId: 1465, qaId: 1486 },
        { name: 'Weekly WhatsApp Unlimited R35', price: 35.0, validity: '7 Day', prodId: 932, qaId: 985 },
        { name: 'Weekly Social 1GB R37', price: 37.0, validity: '7 Day', prodId: 1433, qaId: 1490 },
        { name: 'Monthly TikTok 1GB R37', price: 37.0, validity: '30 Day', prodId: 1460, qaId: 1479 },
        { name: 'Weekly Chat 1GB R38', price: 38.0, validity: '7 Day', prodId: 1432, qaId: 1453 },
        { name: 'Whatsapp 300MB +15min All Net Voice R15', price: 15.0, validity: '7 Day', prodId: 1559, qaId: 1686 },
        { name: 'Whatsapp 750MB + 20min All Net Voice R25', price: 25.0, validity: '7 Day', prodId: 1560, qaId: 1687 },
        { name: 'Unlimited Whatsapp + 20min All Net Voice R37', price: 37.0, validity: '7 Day', prodId: 1561, qaId: 1690 },
        { name: 'Weekend TikTok 500MB R16', price: 16.0, validity: 'Sat & Sun', prodId: 1411, qaId: 1432 },
        { name: 'Weekend 1GB R52', price: 52.0, validity: 'Weekend', prodId: 1428, qaId: 1449 },
        { name: 'Weekly 500MB R53', price: 53.0, validity: '7 Day', prodId: 1466, qaId: 1487 },
        { name: 'Weekly Social 2GB R63', price: 63.0, validity: '7 Day', prodId: 1440, qaId: 1460 },
        { name: 'Weekly 1GB R79', price: 79.0, validity: '7 Day', prodId: 1467, qaId: 1488 },
        { name: 'Weekly 2GB R105', price: 105.0, validity: '7 Day', prodId: 1468, qaId: 1489 },
      ],
      'Monthly Bundles': [
        { name: 'Monthly Social 100MB R11', price: 11.0, validity: '30 Day', prodId: 1399, qaId: 1420 },
        { name: '14 day FreeMe 300MB R31', price: 31.0, validity: '14 Day', prodId: 1429, qaId: 1450 },
        { name: '14 day FreeMe 600MB R41', price: 41.0, validity: '14 Day', prodId: 1434, qaId: 1454 },
        { name: 'Monthly WhatsApp Bundle 1GB R30', price: 30.0, validity: '31 Day', prodId: 1541, qaId: 1534 },
        { name: 'Monthly Social 500MB R30', price: 30.0, validity: '30 Day', prodId: 1423, qaId: 1444 },
        { name: 'Monthly Social 1GB R42', price: 42.0, validity: '30 Day', prodId: 1436, qaId: 1456 },
        { name: 'LTE On-net 3GB+3GB', price: 49.0, validity: '14 Day', prodId: 699, qaId: 806 },
        { name: 'Monthly WhatsApp 1.5GB R41', price: 41.0, validity: '30 Day', prodId: 1437, qaId: 1457 },
        { name: 'Monthly Social 2GB R74', price: 74.0, validity: '30 Day', prodId: 1442, qaId: 1491 },
        { name: 'Data Bundle 1.2GB + 1.2GB R79', price: 79.0, validity: '60 Day', prodId: 1538, qaId: 1523 },
        { name: 'LTE On-net 7.5GB + 7.5GB', price: 99.0, validity: '60 Day', prodId: 500, qaId: 591 },
        { name: 'Monthly WhatsApp Unlimited R100', price: 100.0, validity: '30 Day', prodId: 935, qaId: 988 },
        { name: 'Monthly FreeMe 1.2GB R105', price: 105.0, validity: '30 Day', prodId: 1443, qaId: 1462 },
        { name: 'Monthly Social 3GB R105', price: 105.0, validity: '30 Day', prodId: 1444, qaId: 1463 },
        { name: 'Monthly Unlimited Whatsapp +50min All Net Voice R105', price: 105.0, validity: '31 Day', prodId: 1562, qaId: 1691 },
        { name: 'Monthly FreeMe 1.8GB R146', price: 146.0, validity: '30 Day', prodId: 1445, qaId: 1464 },
        { name: 'LTE On-net 10GB + 10GB', price: 149.0, validity: '60 Day', prodId: 501, qaId: 592 },
        { name: 'All Networks Data 2.5GB + 2.5GB R149', price: 149.0, validity: '60 Day', prodId: 1523, qaId: 1514 },
        { name: 'LTE On-net 15GB+15GB R199', price: 199.0, validity: '60 Day', prodId: 1241, qaId: 1191 },
        { name: 'Monthly FreeMe 3.5GB R200', price: 200.0, validity: '30 Day', prodId: 1446, qaId: 1465 },
        { name: 'Data Bundle 3.5GB + 3.5GB R209', price: 209.0, validity: '60 Day', prodId: 1539, qaId: 1524 },
        { name: 'Monthly LTE 25GB + NightSurfer 25GB R259', price: 259.0, validity: '30 Day', prodId: 1447, qaId: 1466 },
        { name: 'All Networks Data 5.5GB + 5.5GB R299', price: 299.0, validity: '60 Day', prodId: 1524, qaId: 1515 },
        { name: 'Monthly FreeMe 6.5GB R305', price: 305.0, validity: '30 Day', prodId: 1448, qaId: 1467 },
        { name: 'Monthly LTE 30GB + NightSurfer 30GB R319', price: 319.0, validity: '30 Day', prodId: 1449, qaId: 1468 },
        { name: 'Monthly LTE 40GB + NightSurfer 40GB R369', price: 369.0, validity: '30 Day', prodId: 1450, qaId: 1469 },
        { name: 'Monthly FreeMe 11.5GB R410', price: 410.0, validity: '30 Day', prodId: 1451, qaId: 1470 },
        { name: 'Monthly LTE 60GB + NightSurfer 60GB R449', price: 449.0, validity: '30 Day', prodId: 1452, qaId: 1471 },
        { name: 'All Networks Data 12GB + 12GB R499', price: 499.0, validity: '60 Day', prodId: 1525, qaId: 1516 },
        { name: 'Monthly LTE 80GB + NightSurfer 80GB R529', price: 529.0, validity: '30 Day', prodId: 1453, qaId: 1472 },
        { name: 'Monthly LTE 120GB + NightSurfer 120GB R579', price: 579.0, validity: '30 Day', prodId: 1454, qaId: 1473 },
        { name: 'All Networks Data 20GB R599', price: 599.0, validity: '180 Day', prodId: 1526, qaId: 1512 },
        { name: 'All Networks Data 50GB R699', price: 699.0, validity: '180 Day', prodId: 1527, qaId: 1513 },
        { name: 'Monthly FreeMe 28GB R725', price: 725.0, validity: '30 Day', prodId: 1455, qaId: 1474 },
        { name: 'All Networks Data 100GB R999', price: 999.0, validity: '180 Day', prodId: 1528, qaId: 1517 },
      ],
      'Voice': [
        { name: 'Weekly Voice 10min R5.50', price: 5.5, validity: '7 Day', prodId: 1402, qaId: 1423 },
        { name: 'Weekly Voice 20min R9.50', price: 9.5, validity: '7 Day', prodId: 1405, qaId: 1426 },
        { name: 'Monthly Voice 25min R16', price: 16.0, validity: '30 Day', prodId: 1407, qaId: 1428 },
        { name: 'Weekend Unlimited On Net R19', price: 19.0, validity: 'Sat & Sun', prodId: 1563, qaId: 1692 },
        { name: 'Weekly Unlimited On Net R25', price: 25.0, validity: '7 Day', prodId: 1564, qaId: 1693 },
        { name: 'Monthly Voice 50min R32', price: 32.0, validity: '30 Day', prodId: 1409, qaId: 1430 },
        { name: 'Monthly Unlimited On Net R49', price: 49.0, validity: '31 Day', prodId: 1565, qaId: 1694 },
        { name: 'Monthly Voice 100min R63', price: 63.0, validity: '30 Day', prodId: 1403, qaId: 1424 },
        { name: 'Hourly 150MB R5.50', price: 5.5, validity: '1 Hour', prodId: 1417, qaId: 1438 },
        { name: 'Hourly 300MB R9', price: 9.0, validity: '1 Hour', prodId: 1419, qaId: 1440 },
        { name: 'Hourly 250MB R11', price: 11.0, validity: 'Hourly', prodId: 1418, qaId: 1439 },
        { name: 'Hourly 400MB R13', price: 13.0, validity: 'Hourly', prodId: 1420, qaId: 1441 },
        { name: 'Hourly 500MB R16', price: 16.0, validity: 'Hourly', prodId: 1421, qaId: 1442 },
        { name: 'Monthly Voice 200min R105', price: 105.0, validity: '30 Day', prodId: 1406, qaId: 1427 },
        { name: 'Monthly Voice 300min R159', price: 159.0, validity: '30 Day', prodId: 1408, qaId: 1429 },
        { name: 'Monthly Voice 500min R265', price: 265.0, validity: '30 Day', prodId: 1410, qaId: 1431 },
        { name: 'Monthly Voice 1000min R559', price: 559.0, validity: '30 Day', prodId: 1404, qaId: 1425 },
      ],
    },
  },
  {
    id: 'unipin',
    name: 'Unipin Gaming',
    icon: '🕹️',
    color: '#9147FF',
    section: 'lifestyle',
    products: [
      { name: 'Unipin R20', price: 20.0, validity: '-', prodId: 97, qaId: 97 },
      { name: 'Unipin R30', price: 30.0, validity: '-', prodId: 98, qaId: 98 },
      { name: 'Unipin R50', price: 50.0, validity: '-', prodId: 99, qaId: 99 },
      { name: 'Unipin R100', price: 100.0, validity: '-', prodId: 100, qaId: 100 },
      { name: 'Unipin R200', price: 200.0, validity: '-', prodId: 137, qaId: 137 },
      { name: 'Unipin R250', price: 250.0, validity: '-', prodId: 101, qaId: 101 },
      { name: 'Unipin R300', price: 300.0, validity: '-', prodId: 138, qaId: 138 },
      { name: 'Unipin R500', price: 500.0, validity: '-', prodId: 102, qaId: 102 },
      { name: 'Unipin R1000', price: 1000.0, validity: '-', prodId: 120, qaId: 120 },
    ],
  },
  {
    id: 'blu_voucher',
    name: 'Blu Vouchers',
    icon: '💙',
    color: '#1565C0',
    section: 'lifestyle',
    products: [
      { name: 'Blu Voucher R2', price: 2.0, validity: '36 months', prodId: 1568, qaId: 1673 },
      { name: 'Blu Voucher R5', price: 5.0, validity: '36 months', prodId: 1569, qaId: 1674 },
      { name: 'Blu Voucher R10', price: 10.0, validity: '-', prodId: 783, qaId: 799 },
      { name: 'Blu Voucher R20', price: 20.0, validity: '-', prodId: 784, qaId: 800 },
      { name: 'Blu Voucher R30', price: 30.0, validity: '-', prodId: 785, qaId: 801 },
      { name: 'Blu Voucher R50', price: 50.0, validity: '-', prodId: 786, qaId: 802 },
      { name: 'Blu Voucher R100', price: 100.0, validity: '-', prodId: 787, qaId: 803 },
      { name: 'Blu Voucher R150', price: 150.0, validity: '-', prodId: 788, qaId: 804 },
      { name: 'Blu Voucher R250', price: 250.0, validity: '-', prodId: 936, qaId: 970 },
      { name: 'Blu Voucher R500', price: 500.0, validity: '-', prodId: 937, qaId: 971 },
      { name: 'Blu Voucher R750', price: 750.0, validity: '-', prodId: 938, qaId: 972 },
      { name: 'Blu Voucher R1000', price: 1000.0, validity: '-', prodId: 939, qaId: 973 },
    ],
  },
  {
    id: 'google_play',
    name: 'Google Play',
    icon: '🎮',
    color: '#34A853',
    section: 'lifestyle',
    products: [
      { name: 'Google Play R10', price: 10.0, validity: '-', prodId: 1248, qaId: 1198 },
      { name: 'Google Play R20', price: 20.0, validity: '-', prodId: 1249, qaId: 1199 },
      { name: 'Google Play R30', price: 30.0, validity: '-', prodId: 1250, qaId: 1200 },
      { name: 'Google Play R50', price: 50.0, validity: '-', prodId: 757, qaId: 777 },
      { name: 'Google Play R100', price: 100.0, validity: '-', prodId: 758, qaId: 778 },
      { name: 'Google Play R250', price: 250.0, validity: '-', prodId: 759, qaId: 779 },
      { name: 'Google Play R500', price: 500.0, validity: '-', prodId: 760, qaId: 780 },
    ],
  },
  {
    id: 'netflix',
    name: 'Netflix',
    icon: '🎬',
    color: '#E50914',
    section: 'lifestyle',
    products: [
      { name: 'Netflix R250', price: 250.0, validity: '-', prodId: 745, qaId: 712 },
      { name: 'Netflix R500', price: 500.0, validity: '-', prodId: 746, qaId: 713 },
    ],
  },
  {
    id: 'uber_eats',
    name: 'Uber Eats',
    icon: '🍔',
    color: '#06C167',
    section: 'lifestyle',
    products: [
      { name: 'Uber Eats R50', price: 50.0, validity: '-', prodId: 751, qaId: 751 },
      { name: 'Uber Eats R100', price: 100.0, validity: '-', prodId: 752, qaId: 717 },
      { name: 'Uber Eats R200', price: 200.0, validity: '-', prodId: 753, qaId: 718 },
    ],
  },
  {
    id: 'uber',
    name: 'Uber',
    icon: '🚗',
    color: '#000000',
    section: 'lifestyle',
    products: [
      { name: 'Uber R50', price: 50.0, validity: '-', prodId: 748, qaId: 750 },
      { name: 'Uber R100', price: 100.0, validity: '-', prodId: 749, qaId: 715 },
      { name: 'Uber R200', price: 200.0, validity: '-', prodId: 750, qaId: 716 },
    ],
  },
  {
    id: 'steam',
    name: 'Steam',
    icon: '🎮',
    color: '#1B2838',
    section: 'lifestyle',
    products: [
      { name: 'Steam R80', price: 80.0, validity: '-', prodId: 779, qaId: 771 },
      { name: 'Steam R150', price: 150.0, validity: '-', prodId: 948, qaId: 946 },
      { name: 'Steam R250', price: 250.0, validity: '-', prodId: 949, qaId: 947 },
      { name: 'Steam R500', price: 500.0, validity: '-', prodId: 950, qaId: 948 },
    ],
  },
  {
    id: 'roblox',
    name: 'Roblox',
    icon: '🧱',
    color: '#E2231A',
    section: 'lifestyle',
    products: [
      { name: 'Roblox R85', price: 85.0, validity: '-', prodId: 1261, qaId: 1227 },
      { name: 'Roblox R100', price: 100.0, validity: '-', prodId: 1262, qaId: 1228 },
      { name: 'Roblox R150', price: 150.0, validity: '-', prodId: 1263, qaId: 1229 },
      { name: 'Roblox R200', price: 200.0, validity: '-', prodId: 1264, qaId: 1230 },
      { name: 'Roblox R250', price: 250.0, validity: '-', prodId: 1265, qaId: 1231 },
      { name: 'Roblox R350', price: 350.0, validity: '-', prodId: 1266, qaId: 1232 },
    ],
  },
  {
    id: 'playstation',
    name: 'PlayStation',
    icon: '🎮',
    color: '#003087',
    section: 'lifestyle',
    products: [
      { name: 'PlayStation Wallet TopUp R250', price: 250.0, validity: '-', prodId: 770, qaId: 758 },
    ],
  },
  {
    id: 'hollywood_bets',
    name: 'Hollywood Bets',
    icon: '🎰',
    color: '#FFD700',
    section: 'lifestyle',
    products: [
      { name: 'Hollywood Bets R5', price: 5.0, validity: '1 month', prodId: 482, qaId: 623 },
      { name: 'Hollywood Bets R10', price: 10.0, validity: '1 month', prodId: 322, qaId: 330 },
      { name: 'Hollywood Bets R20', price: 20.0, validity: '1 month', prodId: 352, qaId: 624 },
      { name: 'Hollywood Bets R50', price: 50.0, validity: '1 month', prodId: 323, qaId: 331 },
      { name: 'Hollywood Bets R100', price: 100.0, validity: '1 month', prodId: 324, qaId: 332 },
      { name: 'Hollywood Bets R200', price: 200.0, validity: '1 month', prodId: 326, qaId: 333 },
      { name: 'Hollywood Bets R500', price: 500.0, validity: '1 month', prodId: 353, qaId: 625 },
      { name: 'Hollywood Bets R1000', price: 1000.0, validity: '1 month', prodId: 354, qaId: 626 },
    ],
  },
  {
    id: 'betway',
    name: 'Betway',
    icon: '🎯',
    color: '#00854A',
    section: 'lifestyle',
    products: [
      { name: 'Betway Bucks R10', price: 10.0, validity: '36 months', prodId: 1174, qaId: 1107 },
      { name: 'Betway Bucks R20', price: 20.0, validity: '36 months', prodId: 1175, qaId: 1108 },
      { name: 'Betway Bucks R30', price: 30.0, validity: '36 months', prodId: 1176, qaId: 1109 },
      { name: 'Betway Bucks R50', price: 50.0, validity: '36 months', prodId: 1177, qaId: 1110 },
      { name: 'Betway Bucks R100', price: 100.0, validity: '36 months', prodId: 1178, qaId: 1111 },
      { name: 'Betway Bucks R150', price: 150.0, validity: '36 months', prodId: 1179, qaId: 1112 },
      { name: 'Betway Bucks R300', price: 300.0, validity: '36 months', prodId: 1470, qaId: 1679 },
      { name: 'Betway Bucks R500', price: 500.0, validity: '36 months', prodId: 1471, qaId: 1680 },
      { name: 'Betway Bucks R1000', price: 1000.0, validity: '36 months', prodId: 1472, qaId: 1681 },
      { name: 'Betway Bucks R1500', price: 1500.0, validity: '36 months', prodId: 1555, qaId: 1682 },
      { name: 'Betway Bucks R2000', price: 2000.0, validity: '36 months', prodId: 1556, qaId: 1683 },
    ],
  },
  {
    id: 'lottostar',
    name: 'LottoStar',
    icon: '⭐',
    color: '#FF6B00',
    section: 'lifestyle',
    products: [
      { name: 'LottoStar R10', price: 10.0, validity: '1 month', prodId: 483, qaId: 483 },
      { name: 'LottoStar R20', price: 20.0, validity: '1 month', prodId: 484, qaId: 484 },
      { name: 'LottoStar R50', price: 50.0, validity: '1 month', prodId: 485, qaId: 485 },
      { name: 'LottoStar R100', price: 100.0, validity: '1 month', prodId: 486, qaId: 486 },
      { name: 'LottoStar R200', price: 200.0, validity: '1 month', prodId: 487, qaId: 487 },
      { name: 'LottoStar R500', price: 500.0, validity: '1 month', prodId: 488, qaId: 488 },
      { name: 'LottoStar R1000', price: 1000.0, validity: '1 month', prodId: 489, qaId: 489 },
    ],
  },
  {
    id: 'supersportbet',
    name: 'SuperSportBet',
    icon: '⚽',
    color: '#003087',
    section: 'lifestyle',
    products: [
      { name: 'SuperSportBet R10', price: 10.0, validity: '-', prodId: 1251, qaId: 1201 },
      { name: 'SuperSportBet R20', price: 20.0, validity: '-', prodId: 1252, qaId: 1202 },
      { name: 'SuperSportBet R30', price: 30.0, validity: '-', prodId: 1253, qaId: 1203 },
      { name: 'SuperSportBet R50', price: 50.0, validity: '-', prodId: 1254, qaId: 1204 },
      { name: 'SuperSportBet R100', price: 100.0, validity: '-', prodId: 1255, qaId: 1205 },
      { name: 'SuperSportBet R150', price: 150.0, validity: '-', prodId: 1256, qaId: 1206 },
      { name: 'SuperSportBet R250', price: 250.0, validity: '-', prodId: 1257, qaId: 1207 },
      { name: 'SuperSportBet R500', price: 500.0, validity: '-', prodId: 1258, qaId: 1208 },
      { name: 'SuperSportBet R750', price: 750.0, validity: '-', prodId: 1259, qaId: 1209 },
      { name: 'SuperSportBet R1000', price: 1000.0, validity: '-', prodId: 1260, qaId: 1210 },
    ],
  },
  {
    id: 'ott',
    name: 'OTT Voucher',
    icon: '📺',
    color: '#795548',
    section: 'lifestyle',
    products: [
      { name: 'OTT R5', price: 5.0, validity: '-', prodId: 609, qaId: 614 },
      { name: 'OTT R10', price: 10.0, validity: '-', prodId: 610, qaId: 613 },
      { name: 'OTT R20', price: 20.0, validity: '-', prodId: 611, qaId: 615 },
      { name: 'OTT R30', price: 30.0, validity: '-', prodId: 612, qaId: 965 },
      { name: 'OTT R50', price: 50.0, validity: '-', prodId: 613, qaId: 616 },
      { name: 'OTT R100', price: 100.0, validity: '-', prodId: 614, qaId: 617 },
      { name: 'OTT R300', price: 300.0, validity: '-', prodId: 615, qaId: 966 },
      { name: 'OTT R500', price: 500.0, validity: '-', prodId: 616, qaId: 967 },
      { name: 'OTT R1000', price: 1000.0, validity: '-', prodId: 617, qaId: 968 },
    ],
  },
  {
    id: 'cycle_lab',
    name: 'Cycle Lab',
    icon: '🚴',
    color: '#FF5722',
    section: 'lifestyle',
    products: [
      { name: 'Cycle Lab R100', price: 100.0, validity: '-', prodId: 1078, qaId: 1041 },
      { name: 'Cycle Lab R150', price: 150.0, validity: '-', prodId: 1079, qaId: 1042 },
      { name: 'Cycle Lab R250', price: 250.0, validity: '-', prodId: 1080, qaId: 1043 },
      { name: 'Cycle Lab R500', price: 500.0, validity: '-', prodId: 1081, qaId: 1044 },
      { name: 'Cycle Lab R2500', price: 2500.0, validity: '-', prodId: 1082, qaId: 1045 },
    ],
  },
  {
    id: 'world_call',
    name: 'World Call',
    icon: '📞',
    color: '#607D8B',
    section: 'lifestyle',
    products: [
      { name: 'World Call R10', price: 10.0, validity: '1 month', prodId: 32, qaId: 32 },
      { name: 'World Call R50', price: 50.0, validity: '1 month', prodId: 14, qaId: 14 },
      { name: 'World Call R100', price: 100.0, validity: '1 month', prodId: 15, qaId: 15 },
      { name: 'World Call R200', price: 200.0, validity: '1 month', prodId: 82, qaId: 82 },
    ],
  },
];

// Section display config
const SECTIONS = [
  { id: 'airtime', label: '📱 Airtime', color: '#E60000' },
  { id: 'data',    label: '📶 Data & Bundles', color: '#0077C8' },
  { id: 'lifestyle', label: '🛍️ Lifestyle', color: '#FF9800' },
];

export default function GeneralVouchersScreen({userData, onBack, theme, onHideTabBar, onShowTabBar}) {
  const [activeSection, setActiveSection] = useState('airtime');

  const [showSound, setShowSound] = useState(false);  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [loading, setLoading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [stage, setStage] = useState('browse');
  const [notice, setNotice] = useState(null);
  const [pendingCard, setPendingCard] = useState(null);
  const [search, setSearch] = useState('');

  const t = theme || {
    bg: '#003865', card: '#0a2545', card2: '#082040',
    text: '#ffffff', subText: '#aaaaaa', darkMode: true, toggle: function() {}
  };

  const sectionCategories = VOUCHER_CATEGORIES.filter(c => c.section === activeSection);

  const getGroupKeys = (cat) => cat.groups ? Object.keys(cat.groups) : null;
  const getProducts = (cat, group) => {
    if (cat.products) return cat.products;
    if (cat.groups && group) return cat.groups[group] || [];
    if (cat.groups) return Object.values(cat.groups).flat();
    return [];
  };

  const filteredProducts = selectedProduct === null && selectedCategory
    ? getProducts(selectedCategory, selectedGroup).filter(p =>
        search === '' || p.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedGroup(null);
    setSelectedProduct(null);
    setStage('browse');
    setPurchaseResult(null);
    setSearch('');
  };

  const handleBack = () => {
    if (stage === 'success') { handleReset(); return; }
    if (selectedProduct) { setSelectedProduct(null); return; }
    if (selectedGroup) { setSelectedGroup(null); return; }
    if (selectedCategory) { setSelectedCategory(null); return; }
    onBack();
  };

  const doVoucherPurchase = async (product) => {
    setLoading(true);
    try {
      // Route lifestyle products to lifestyle endpoint, airtime/data to pinned sales
      const isLifestyle = selectedCategory && selectedCategory.section === 'lifestyle';
      let response, data;

      if (isLifestyle) {
        // Lifestyle vouchers (Uber, Netflix, Google Play, Betway etc.)
        // Use /api/lifestyle-vouchers/purchase with productId
        response = await fetch(API_URL + '/api/lifestyle-vouchers/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberNumber: userData.memberNumber,
            productId: product.prodId,
            productName: product.name,
            amount: product.price,
            quantity: 1,
          })
        });
        data = await response.json();
        if (response.ok && !data.error) {
          setPurchaseResult({
            product: product,
            transactionId: data.reference || data.requestId || '',
            voucherCode: data.token || data.serialNumber || null,
            newBalance: data.newWalletBalance,
            pvEarned: data.pvEarned,
          });
          setStage('success'); setShowSound(true);
        } else {
          setNotice({ type: 'error', title: 'Purchase Failed', message: data.error || data.message || 'Could not complete purchase. Please try again.' });
        }
      } else {
        // Airtime & Data products — use pinned sales endpoint
        response = await fetch(API_URL + '/api/bluelabel/voucher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberNumber: userData.memberNumber,
            prodId: product.prodId,
            amount: product.price,
            paymentMethod: paymentMethod,
          })
        });
        data = await response.json();
        if (data.success) {
          setPurchaseResult({
            product: product,
            transactionId: data.transactionId,
            voucherCode: data.voucherCode,
            newBalance: data.newBalance,
            pvEarned: data.pvEarned,
          });
          setStage('success');
        } else if (data.poolDepleted) {
          setNotice({ type: 'error', title: 'System Busy', message: "Don't panic! Your money is safe. Please retry in 30 minutes." });
        } else {
          setNotice({ type: 'error', title: 'Purchase Failed', message: data.message || 'Could not complete purchase. Please try again.' });
        }
      }
    } catch (e) {
      setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server. Please check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!selectedProduct) return;
    if (paymentMethod === 'wallet') {
      if ((userData.cashWallet || 0) < selectedProduct.price) {
        setNotice({ type: 'error', title: 'Insufficient Funds', message: 'Your wallet balance is R' + (userData.cashWallet || 0).toFixed(2) + '. Top up or pay by card.' });
        return;
      }
      await doVoucherPurchase(selectedProduct);
    } else if (paymentMethod === 'gratitude') {
      if ((userData.gratitudeWallet || 0) < selectedProduct.price) {
        setNotice({ type: 'error', title: 'Insufficient Gratitude Balance', message: 'Your Gratitude balance is R' + (userData.gratitudeWallet || 0).toFixed(2) + '.' });
        return;
      }
      await doVoucherPurchase(selectedProduct);
    } else {
      setLoading(true);
      try {
        const res = await fetch(API_URL + '/api/paygate/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberNumber: userData.memberNumber, amount: selectedProduct.price, email: userData.email })
        });
        const data = await res.json();
        if (data.success && data.redirectUrl) {
          setPendingCard({ product: selectedProduct, payRequestId: data.payRequestId });
          const { Linking } = require('react-native');
          Linking.openURL(data.redirectUrl);
        } else {
          setNotice({ type: 'error', title: 'Payment Error', message: data.message || 'Could not start card payment.' });
        }
      } catch (e) {
        setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCompleteCard = async () => {
    if (!pendingCard) return;
    setLoading(true);
    try {
      const res = await fetch(API_URL + '/api/paygate/status/' + pendingCard.payRequestId);
      const data = await res.json();
      if (data.found && data.credited) {
        await doVoucherPurchase(pendingCard.product);
        setPendingCard(null);
      } else {
        setNotice({ type: 'error', title: 'Payment Pending', message: 'Payment not confirmed yet. Wait a few seconds and try again.' });
      }
    } catch (e) {
      setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server.' });
    } finally {
      setLoading(false);
    }
  };

  // ── RENDER: Success ───────────────────────────────────────────
  if (stage === 'success' && purchaseResult) {
    return (
      <View style={[styles.container, { backgroundColor: t.bg }]}>
        <View style={[styles.header, { backgroundColor: t.card }]}>
          <Text style={styles.title}>✅ Purchase Complete</Text>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>
          <View style={[styles.successCard, { backgroundColor: t.card2, borderColor: '#50C878' }]}>
            <Text style={styles.successIcon}>🎉</Text>
            <Text style={styles.successTitle}>{purchaseResult.product.name}</Text>
            {purchaseResult.voucherCode && (
              <View style={[styles.codeBox, { backgroundColor: t.bg }]}>
                <Text style={styles.codeLabel}>Your Voucher Code</Text>
                <Text style={styles.codeValue}>{purchaseResult.voucherCode}</Text>
              </View>
            )}
            <View style={[styles.receiptBox, { backgroundColor: t.darkMode ? '#0A1628' : '#e8f4ff' }]}>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: t.text }]}>Amount</Text>
                <Text style={styles.receiptOrange}>R{purchaseResult.product.price.toFixed(2)}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: t.text }]}>Home Points</Text>
                <Text style={styles.receiptGreen}>+{(purchaseResult.pvEarned || purchaseResult.product.price * 0.009 * 0.70).toFixed(2)} HC</Text>
              </View>
              {purchaseResult.newBalance !== undefined && (
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: t.text }]}>New Balance</Text>
                  <Text style={styles.receiptOrange}>R{purchaseResult.newBalance.toFixed(2)}</Text>
                </View>
              )}
              {purchaseResult.transactionId && (
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: t.text }]}>Reference</Text>
                  <Text style={[styles.receiptLabel, { color: '#888', fontSize: 10 }]}>{purchaseResult.transactionId}</Text>
                </View>
              )}
            </View>
          </View>
          <Pressable style={styles.primaryBtn} onPress={handleReset}>
            <Text style={styles.primaryBtnText}>Done</Text>
          </Pressable>
          <View style={{ height: 40 }} />
        </ScrollView>
        <Notice notice={notice} onClose={() => setNotice(null)} />
      </View>
    );
  }

  // ── RENDER: Product detail / buy ─────────────────────────────
  if (selectedProduct) {
    return (
      <View style={[styles.container, { backgroundColor: t.bg }]}>
        <View style={[styles.header, { backgroundColor: t.card }]}>
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>{selectedProduct.name}</Text>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>
          <View style={[styles.productDetailCard, { backgroundColor: t.card2, borderColor: selectedCategory.color }]}>
            <Text style={styles.productDetailIcon}>{selectedCategory.icon}</Text>
            <Text style={styles.productDetailName}>{selectedProduct.name}</Text>
            <Text style={styles.productDetailPrice}>R{selectedProduct.price.toFixed(2)}</Text>
            {selectedProduct.validity !== '-' && selectedProduct.validity && (
              <Text style={[styles.productDetailValidity, { color: t.subText }]}>Valid: {selectedProduct.validity}</Text>
            )}
            <Text style={styles.productDetailPV}>+{(selectedProduct.price * 0.009 * 0.70).toFixed(2)} HC earned</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: '#50C878' }]}>Pay With</Text>
          <View style={styles.payRow}>
            {[
              { id: 'wallet', icon: '💰', label: 'Wallet', sub: 'R' + (userData.cashWallet || 0).toFixed(2) },
              { id: 'card', icon: '💳', label: 'Card', sub: userData.cardLast4 ? '**** ' + userData.cardLast4 : (userData.bankName || 'Secure Card') },
              { id: 'gratitude', icon: '🙏', label: 'Gratitude', sub: 'R' + (userData.gratitudeWallet || 0).toFixed(2) },
            ].map(pm => (
              <Pressable
                key={pm.id}
                onPress={() => setPaymentMethod(pm.id)}
                style={[styles.payOption, {
                  backgroundColor: paymentMethod === pm.id ? (t.darkMode ? '#1A2F1A' : '#e8fff0') : (t.darkMode ? '#082040' : '#fff'),
                  borderColor: paymentMethod === pm.id ? '#50C878' : (t.darkMode ? '#0d2d50' : '#ddd'),
                }]}
              >
                <Text style={styles.payIcon}>{pm.icon}</Text>
                <Text style={[styles.payLabel, { color: paymentMethod === pm.id ? '#50C878' : t.text }]}>{pm.label}</Text>
                <Text style={[styles.paySub, { color: t.subText }]}>{pm.sub}</Text>
              </Pressable>
            ))}
          </View>

          {pendingCard && (
            <View style={[styles.pendingCard, { backgroundColor: t.darkMode ? '#1A2800' : '#fff8e1' }]}>
              <Text style={styles.pendingText}>Complete your R{pendingCard.product.price.toFixed(2)} PayGate payment, then tap below.</Text>
              <Pressable onPress={handleCompleteCard} disabled={loading} style={styles.pendingBtn}>
                <Text style={styles.pendingBtnText}>{loading ? 'Checking...' : 'I Paid — Complete Purchase'}</Text>
              </Pressable>
              <Pressable onPress={() => setPendingCard(null)}>
                <Text style={[styles.paySub, { color: t.subText, textAlign: 'center', marginTop: 8 }]}>Cancel</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            style={[styles.primaryBtn, loading && { opacity: 0.5 }]}
            onPress={handleBuy}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>
                  {paymentMethod === 'card' ? 'Pay by Card — R' + selectedProduct.price.toFixed(2) : 'Buy Now — R' + selectedProduct.price.toFixed(2)}
                </Text>
            }
          </Pressable>
          <View style={{ height: 40 }} />
        </ScrollView>
        <Notice notice={notice} onClose={() => setNotice(null)} />
      </View>
    );
  }

  // ── RENDER: Product list ──────────────────────────────────────
  if (selectedCategory) {
    const groupKeys = getGroupKeys(selectedCategory);
    const products = getProducts(selectedCategory, selectedGroup);

    return (
      <View style={[styles.container, { backgroundColor: t.bg }]}>
        <View style={[styles.header, { backgroundColor: t.card }]}>
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>{selectedCategory.name}</Text>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>
          {/* Group tabs for network categories */}
          {groupKeys && groupKeys.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}
        contentContainerStyle={{ paddingBottom: 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => setSelectedGroup(null)}
                  style={[styles.groupTab, { borderColor: !selectedGroup ? selectedCategory.color : '#0d2d50', backgroundColor: !selectedGroup ? selectedCategory.color + '30' : t.card2 }]}
                >
                  <Text style={[styles.groupTabText, { color: !selectedGroup ? selectedCategory.color : t.subText }]}>All</Text>
                </Pressable>
                {groupKeys.map(g => (
                  <Pressable
                    key={g}
                    onPress={() => setSelectedGroup(g)}
                    style={[styles.groupTab, { borderColor: selectedGroup === g ? selectedCategory.color : '#0d2d50', backgroundColor: selectedGroup === g ? selectedCategory.color + '30' : t.card2 }]}
                  >
                    <Text style={[styles.groupTabText, { color: selectedGroup === g ? selectedCategory.color : t.subText }]}>{g}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}

          <TextInput
            style={[styles.searchInput, { backgroundColor: t.card2, color: t.text, borderColor: t.darkMode ? '#0d2d50' : '#ddd' }]}
            placeholder="Search products..."
            placeholderTextColor={t.subText}
            value={search}
            onChangeText={setSearch}
          />

          <Text style={[styles.sectionLabel, { color: t.subText }]}>
            {filteredProducts.length} products
          </Text>

          {filteredProducts.map((p, i) => (
            <Pressable
              key={i}
              style={[styles.productRow, { backgroundColor: t.card2, borderColor: t.darkMode ? '#0d2d50' : '#eee' }]}
              onPress={() => setSelectedProduct(p)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.productName, { color: t.text }]}>{p.name}</Text>
                {p.validity && p.validity !== '-' && (
                  <Text style={[styles.productValidity, { color: t.subText }]}>{p.validity}</Text>
                )}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.productPrice, { color: selectedCategory.color }]}>R{p.price.toFixed(2)}</Text>
                <Text style={styles.productPV}>+{(p.price * 0.009 * 0.70).toFixed(2)} HC</Text>
              </View>
            </Pressable>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
        <Notice notice={notice} onClose={() => setNotice(null)} />
      </View>
    );
  }

  // ── RENDER: Category grid ─────────────────────────────────────
  const _lastScrollY = React.useRef(0);
  const _handleScroll = React.useCallback(({ nativeEvent }) => {
    const currentY = nativeEvent.contentOffset.y;
    if (currentY > _lastScrollY.current + 5) {
      onHideTabBar && onHideTabBar();
    } else if (currentY < _lastScrollY.current - 5) {
      onShowTabBar && onShowTabBar();
    }
    _lastScrollY.current = currentY;
  }, [onHideTabBar, onShowTabBar]);

  return (
    <>
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Pressable style={styles.modeToggle} onPress={t.toggle}>
          <Text style={{ fontSize: 18 }}>{t.darkMode ? '☀️' : '🌙'}</Text>
        </Pressable>
        <Text style={styles.title}>Vouchers & Data</Text>
        <Text style={[styles.subtitle, { color: t.subText }]}>537 products • Earn Home Points on every purchase</Text>
      </View>

      {/* Section tabs */}
      <View style={[styles.sectionTabs, { backgroundColor: t.card }]}>
        {SECTIONS.map(s => (
          <Pressable
            key={s.id}
            onPress={() => { setActiveSection(s.id); setSelectedCategory(null); }}
            style={[styles.sectionTab, { borderBottomColor: activeSection === s.id ? s.color : 'transparent', borderBottomWidth: 3 }]}
          >
            <Text style={[styles.sectionTabText, { color: activeSection === s.id ? s.color : t.subText }]}>{s.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>
        <View style={styles.categoryGrid}>
          {sectionCategories.map(cat => (
            <Pressable
              key={cat.id}
              style={[styles.categoryCard, { backgroundColor: t.card2, borderColor: cat.color }]}
              onPress={() => { setSelectedCategory(cat); setSelectedGroup(null); setSearch(''); }}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryName, { color: t.text }]}>{cat.name}</Text>
              <Text style={[styles.categoryCount, { color: cat.color }]}>
                {cat.products ? cat.products.length : Object.values(cat.groups).flat().length} products
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: t.card2, borderColor: '#50C878' }]}>
          <Text style={[styles.infoTitle, { color: '#50C878' }]}>💡 How It Works</Text>
          <Text style={[styles.infoText, { color: t.text }]}>• Browse 537+ products across 22 categories</Text>
          <Text style={[styles.infoText, { color: t.text }]}>• Pay with Wallet, Card, or Gratitude Wallet</Text>
          <Text style={[styles.infoText, { color: t.text }]}>• Earn Home Points on every transaction</Text>
          <Text style={[styles.infoText, { color: t.text }]}>• Home Points move you up the housing queue</Text>
        </View>
        <View style={{ height: 40 }} />

      
      </ScrollView>

      <Notice notice={notice} onClose={() => setNotice(null)} />
    </View>
      {showSound && Platform.OS !== 'web' && <WebView source={{html: SUCCESS_SOUND_HTML}} style={{width:0,height:0,position:'absolute',top:-9999,left:-9999}} javaScriptEnabled={true} mediaPlaybackRequiresUserAction={false} allowsInlineMediaPlayback={true} onLoad={()=>{setTimeout(()=>setShowSound(false),3500);}} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center', position: 'relative' },
  backBtn: { position: 'absolute', left: 20, top: 18, zIndex: 10 },
  backText: { fontSize: 14, color: '#50C878', fontWeight: 'bold' },
  modeToggle: { position: 'absolute', right: 20, top: 14, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,152,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, color: '#FF9800', fontWeight: 'bold', letterSpacing: 0.5, marginTop: 4 },
  subtitle: { fontSize: 12, marginTop: 4 },
  sectionTabs: { flexDirection: 'row', paddingHorizontal: 10 },
  sectionTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  sectionTabText: { fontSize: 11, fontWeight: 'bold' },
  content: { flex: 1, padding: 16 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  categoryCard: { width: '47%', padding: 18, borderRadius: 14, alignItems: 'center', borderWidth: 2 },
  categoryIcon: { fontSize: 36, marginBottom: 8 },
  categoryName: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  categoryCount: { fontSize: 11, fontWeight: 'bold' },
  groupTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  groupTabText: { fontSize: 12, fontWeight: 'bold' },
  searchInput: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12, fontSize: 14 },
  sectionLabel: { fontSize: 12, marginBottom: 10, fontWeight: 'bold' },
  productRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1 },
  productName: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  productValidity: { fontSize: 11 },
  productPrice: { fontSize: 16, fontWeight: 'bold' },
  productPV: { fontSize: 10, color: '#50C878' },
  productDetailCard: { padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 20, borderWidth: 2 },
  productDetailIcon: { fontSize: 48, marginBottom: 10 },
  productDetailName: { fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  productDetailPrice: { fontSize: 42, color: '#FF9800', fontWeight: 'bold' },
  productDetailValidity: { fontSize: 12, marginTop: 4 },
  productDetailPV: { fontSize: 13, color: '#50C878', marginTop: 8, fontWeight: 'bold' },
  payRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  payOption: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 2 },
  payIcon: { fontSize: 20, marginBottom: 4 },
  payLabel: { fontSize: 12, fontWeight: 'bold' },
  paySub: { fontSize: 10, marginTop: 2 },
  pendingCard: { borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#FF9800' },
  pendingText: { color: '#FF9800', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  pendingBtn: { backgroundColor: '#FF9800', padding: 12, borderRadius: 10, alignItems: 'center' },
  pendingBtnText: { color: '#fff', fontWeight: 'bold' },
  primaryBtn: { backgroundColor: '#50C878', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#003865', fontSize: 17, fontWeight: 'bold' },
  successCard: { padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 20, borderWidth: 2 },
  successIcon: { fontSize: 48, marginBottom: 10 },
  successTitle: { fontSize: 18, color: '#50C878', fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  codeBox: { padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 16, width: '100%' },
  codeLabel: { fontSize: 11, color: '#888', marginBottom: 6 },
  codeValue: { fontSize: 22, color: '#FF9800', fontWeight: 'bold', letterSpacing: 2, fontFamily: 'monospace' },
  receiptBox: { width: '100%', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#1A2640' },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#1A2640' },
  receiptLabel: { fontSize: 12 },
  receiptOrange: { fontSize: 14, color: '#FF9800', fontWeight: 'bold' },
  receiptGreen: { fontSize: 13, color: '#50C878', fontWeight: 'bold' },
  infoCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  infoTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  infoText: { fontSize: 12, marginVertical: 3, lineHeight: 20 },
});





