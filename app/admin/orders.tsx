
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, Linking, Modal, RefreshControl,
  ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const NAV    = '#0f2356';
const NAV2   = '#1a3285';
const RED    = '#e53e3e';
const GREEN  = '#16a34a';
const ORANGE = '#d97706';
const BLUE   = '#2563eb';
const PURPLE = '#7c3aed';
const BG     = '#f7f8fc';
const BORDER = '#e5e7eb';
const TEXT   = '#1a202c';
const TEXT2  = '#718096';
const TEXT3  = '#a0aec0';

function IconBack({ size=20, color='white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></Svg>; }
function IconTruck({ size=16, color='white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="1" y="3" width="15" height="13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><Path d="M16 8h4l3 3v5h-7V8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><Circle cx="5.5" cy="18.5" r="2.5" stroke={color} strokeWidth={2}/><Circle cx="18.5" cy="18.5" r="2.5" stroke={color} strokeWidth={2}/></Svg>; }
function IconCheck({ size=16, color='white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="20 6 9 17 4 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></Svg>; }
function IconX({ size=16, color=RED }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2}/><Line x1="15" y1="9" x2="9" y2="15" stroke={color} strokeWidth={2} strokeLinecap="round"/><Line x1="9" y1="9" x2="15" y2="15" stroke={color} strokeWidth={2} strokeLinecap="round"/></Svg>; }
function IconChevron({ size=16, color=TEXT3 }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="9 18 15 12 9 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></Svg>; }
function IconMap({ size=15, color='white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={color} strokeWidth={2}/><Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={2}/></Svg>; }
function IconPDF({ size=15, color='white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><Polyline points="14 2 14 8 20 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></Svg>; }
function IconPhone({ size=15, color='white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.08 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></Svg>; }
function IconWA({ size=15, color='white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></Svg>; }
function IconShare({ size=15, color='white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="18" cy="5" r="3" stroke={color} strokeWidth={2}/><Circle cx="6" cy="12" r="3" stroke={color} strokeWidth={2}/><Circle cx="18" cy="19" r="3" stroke={color} strokeWidth={2}/><Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={color} strokeWidth={2} strokeLinecap="round"/><Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={color} strokeWidth={2} strokeLinecap="round"/></Svg>; }

const SC: any = {
  en_preparation: { label: 'En préparation', color: ORANGE, bg: '#fef3c7', border: '#fcd34d', emoji: '⏳' },
  en_attente:     { label: 'En route',        color: BLUE,   bg: '#dbeafe', border: '#93c5fd', emoji: '🚚' },
  livree:         { label: 'Livrée',          color: GREEN,  bg: '#dcfce7', border: '#86efac', emoji: '✅' },
  annulee:        { label: 'Annulée',         color: RED,    bg: '#fee2e2', border: '#fca5a5', emoji: '❌' },
  pending:        { label: 'En attente',      color: TEXT2,  bg: '#f3f4f6', border: '#d1d5db', emoji: '🕐' },
  confirmed:      { label: 'Confirmée',       color: PURPLE, bg: '#ede9fe', border: '#c4b5fd', emoji: '✔️' },
  in_delivery:    { label: 'En livraison',    color: BLUE,   bg: '#dbeafe', border: '#93c5fd', emoji: '🛵' },
  delivered:      { label: 'Livrée',          color: GREEN,  bg: '#dcfce7', border: '#86efac', emoji: '✅' },
  failed:         { label: 'Échouée',         color: RED,    bg: '#fee2e2', border: '#fca5a5', emoji: '❌' },
  absent:         { label: 'Absent',          color: ORANGE, bg: '#fef3c7', border: '#fcd34d', emoji: '👻' },
};

type MainScreen    = 'main' | 'fournitures' | 'catalogue';
type SubScreen     = 'libs' | 'cases' | 'ecoles' | 'niveaux' | 'branches' | 'orders';
type CatalogueTab  = 'prep' | 'route' | 'annulee' | 'livree';

function MiniBadges({ c }: { c: any }) {
  return (
    <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginTop: 5 }}>
      {c.prep > 0 && <View style={[mb.b, { backgroundColor: '#fef3c7', borderColor: '#fcd34d' }]}><Text style={[mb.t, { color: ORANGE }]}>⏳ {c.prep}</Text></View>}
      {c.att  > 0 && <View style={[mb.b, { backgroundColor: '#dbeafe', borderColor: '#93c5fd' }]}><Text style={[mb.t, { color: BLUE   }]}>🚚 {c.att}</Text></View>}
      {c.liv  > 0 && <View style={[mb.b, { backgroundColor: '#dcfce7', borderColor: '#86efac' }]}><Text style={[mb.t, { color: GREEN  }]}>✅ {c.liv}</Text></View>}
      {c.ann  > 0 && <View style={[mb.b, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]}><Text style={[mb.t, { color: RED    }]}>❌ {c.ann}</Text></View>}
    </View>
  );
}
const mb = StyleSheet.create({
  b: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  t: { fontSize: 10, fontWeight: '800' },
});

// ── REÇU HTML
function buildRecuHTML(order: any, driverName: string) {
  const sc = SC[order.status] || SC['en_preparation'];
  const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
  const items = (order.items || []).map((item: any) => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#1e293b;">${item.item_name}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:12px;text-align:center;">×${item.quantity}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:12px;text-align:right;font-weight:700;">${Number(item.unit_price * item.quantity).toFixed(2)} MAD</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; width: 80mm; padding: 12px; color: #1e293b; }
  .header { text-align: center; border-bottom: 2px dashed #0f2356; padding-bottom: 10px; margin-bottom: 10px; }
  .logo { font-size: 22px; font-weight: 900; color: #0f2356; }
  .logo span { color: #ef4444; }
  .title { font-size: 11px; color: #64748b; margin-top: 3px; letter-spacing: 1px; }
  .section { margin-bottom: 10px; }
  .label { font-size: 9px; font-weight: 800; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 3px; }
  .value { font-size: 13px; font-weight: 700; color: #1e293b; }
  .value-big { font-size: 16px; font-weight: 900; color: #0f2356; }
  .divider { border-top: 1px dashed #e2e8f0; margin: 8px 0; }
  .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; background: ${sc.bg}; color: ${sc.color}; border: 1px solid ${sc.border}; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th { font-size: 9px; font-weight: 800; color: #94a3b8; padding: 4px 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
  .driver-box { background: #f0f9ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 8px; margin-bottom: 8px; }
  .driver-label { font-size: 9px; font-weight: 800; color: #3b82f6; letter-spacing: 1px; }
  .driver-name { font-size: 14px; font-weight: 900; color: #1d4ed8; }
  .cut-line { text-align: center; font-size: 10px; color: #94a3b8; margin: 6px 0; letter-spacing: 2px; }
  .footer { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 12px; border-top: 1px dashed #e2e8f0; padding-top: 8px; }
</style>
</head><body>
  <div class="header">
    <div class="logo">School<span>Box</span></div>
    <div class="title">BON DE LIVRAISON — CATALOGUE</div>
    <div style="font-size:10px;color:#64748b;margin-top:4px;">${date}</div>
    <div style="margin-top:6px;"><span class="status">${sc.emoji} ${sc.label}</span></div>
  </div>

  <div class="section">
    <div class="label">👨‍🎓 Élève</div>
    <div class="value-big">${order.student?.full_name || '—'}</div>
    <div class="value" style="font-size:11px;color:#475569;margin-top:2px;">
      ${order.student?.school?.name || ''} — ${order.student?.level?.name || ''} ${order.student?.class?.name || ''}
    </div>
  </div>

  <div class="divider"></div>

  <div class="section">
    <div class="label">👤 Parent</div>
    <div class="value">${order.parent_code?.parent_name || '—'}</div>
  </div>

  <div class="section">
    <div class="label">📱 Téléphone</div>
    <div class="value-big" style="color:#1d4ed8;">${order.parent_code?.parent_phone || order.phone || '—'}</div>
  </div>

  ${order.address ? `
  <div class="section">
    <div class="label">📍 Adresse</div>
    <div class="value">${order.address}</div>
  </div>` : ''}

  <div class="divider"></div>

  <div class="section">
    <div class="label">🛍️ Articles</div>
    <table>
      <thead><tr><th>Article</th><th style="text-align:center">Qté</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${items}</tbody>
    </table>
    ${order.wrapping ? `<div style="font-size:10px;color:#f59e0b;font-weight:700;margin-top:6px;">🛡️ Protection cahiers incluse</div>` : ''}
  </div>

  <div class="divider"></div>

  <div class="row">
    <div class="label">💰 TOTAL</div>
    <div style="font-size:18px;font-weight:900;color:#0f2356;">${Number(order.total_price).toFixed(2)} MAD</div>
  </div>

  <div class="divider"></div>

  ${driverName ? `
  <div class="driver-box">
    <div class="driver-label">🚚 LIVREUR ASSIGNÉ</div>
    <div class="driver-name">${driverName}</div>
  </div>` : ''}

  <div class="cut-line">✂ - - - - - - - - - - - - - - -</div>

  <div class="footer">
    SchoolBox — Bon de livraison<br/>${date}
  </div>
</body></html>`;
}

// ── PDF TOUTES COMMANDES
function buildAllOrdersPDF(orders: any[], label: string) {
  const rows = orders.map((o, i) => {
    const sc = SC[o.status] || SC['en_preparation'];
    return `<tr style="background:${i%2===0?'#fff':'#f9fafb'};">
      <td style="padding:9px 10px;font-size:12px;font-weight:700;color:#1a202c;">${o.student?.full_name||'—'}</td>
      <td style="padding:9px 10px;font-size:11px;color:#718096;">${o.student?.school?.name||'—'}</td>
      <td style="padding:9px 10px;font-size:11px;color:#718096;">${o.student?.level?.name||''}${o.student?.class?.name?' / '+o.student.class.name:''}</td>
      <td style="padding:9px 10px;font-size:11px;color:#718096;">${o.parent_code?.parent_name||'—'}</td>
      <td style="padding:9px 10px;font-size:11px;color:#718096;">${o.parent_code?.parent_phone||'—'}</td>
      <td style="padding:9px 10px;font-size:11px;"><span style="background:${sc.bg};color:${sc.color};border:1px solid ${sc.border};border-radius:20px;padding:3px 8px;font-weight:800;font-size:10px;">${sc.emoji} ${sc.label}</span></td>
      <td style="padding:9px 10px;font-size:11px;text-align:center;"><span style="background:#ffedd5;color:#ea580c;border-radius:20px;padding:3px 8px;font-size:10px;font-weight:800;">🛍️</span></td>
      <td style="padding:9px 10px;font-size:12px;font-weight:900;color:#0f2356;text-align:right;">${Number(o.total_price).toFixed(2)}</td>
    </tr>`;
  }).join('');
  const total = orders.reduce((s,o)=>s+Number(o.total_price),0);
  const now = new Date().toLocaleString('fr-FR');
  const prep  = orders.filter(o=>['en_preparation','pending','confirmed'].includes(o.status)).length;
  const route = orders.filter(o=>['en_attente','in_delivery'].includes(o.status)).length;
  const livr  = orders.filter(o=>['livree','delivered'].includes(o.status)).length;
  const ann   = orders.filter(o=>['annulee','failed'].includes(o.status)).length;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif;}
body{padding:24px;background:white;}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #e5e7eb;}
.logo-row{display:flex;align-items:center;gap:12px;}
.logo-box{width:44px;height:44px;background:#0f2356;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:900;color:white;}
h1{font-size:20px;font-weight:900;color:#0f2356;}
.sub{font-size:11px;color:#718096;font-weight:600;margin-top:2px;}
.ri{text-align:right;}
.rt{font-size:13px;font-weight:900;color:#1a202c;}
.rd{font-size:11px;color:#718096;margin-top:3px;}
.summary{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;}
.sc{background:#f9fafb;border-radius:12px;padding:12px 16px;border:1px solid #e5e7eb;flex:1;min-width:90px;}
.sn{font-size:20px;font-weight:900;color:#0f2356;}
.sl{font-size:10px;font-weight:800;color:#718096;letter-spacing:0.5px;margin-top:2px;}
table{width:100%;border-collapse:collapse;margin-bottom:16px;}
th{background:#0f2356;color:white;padding:9px 10px;font-size:10px;font-weight:800;text-align:left;letter-spacing:0.5px;}
th:last-child{text-align:right;}
.tr{background:#0f2356;color:white;}
.tr td{padding:11px 10px;font-weight:900;font-size:13px;border:none;color:white;}
.footer{text-align:center;font-size:10px;color:#a0aec0;padding-top:14px;border-top:1px solid #e5e7eb;}
</style></head><body>
<div class="hdr">
  <div class="logo-row">
    <div class="logo-box">SB</div>
    <div><h1>SchoolBox</h1><div class="sub">STATISTIQUES CATALOGUE</div></div>
  </div>
  <div class="ri"><div class="rt">${label||'Rapport complet'}</div><div class="rd">Généré le ${now}</div></div>
</div>
<div class="summary">
  <div class="sc"><div class="sn">${orders.length}</div><div class="sl">TOTAL</div></div>
  <div class="sc" style="background:#fef3c7;border-color:#fcd34d;"><div class="sn" style="color:#d97706;">${prep}</div><div class="sl">⏳ EN PRÉPA</div></div>
  <div class="sc" style="background:#dbeafe;border-color:#93c5fd;"><div class="sn" style="color:#2563eb;">${route}</div><div class="sl">🚚 EN ROUTE</div></div>
  <div class="sc" style="background:#dcfce7;border-color:#86efac;"><div class="sn" style="color:#16a34a;">${livr}</div><div class="sl">✅ LIVRÉES</div></div>
  <div class="sc" style="background:#fee2e2;border-color:#fca5a5;"><div class="sn" style="color:#e53e3e;">${ann}</div><div class="sl">❌ ANNULÉES</div></div>
  <div class="sc"><div class="sn">${total.toFixed(2)}</div><div class="sl">TOTAL MAD</div></div>
</div>
<table>
  <thead><tr><th>ÉLÈVE</th><th>ÉCOLE</th><th>NIV/BR</th><th>PARENT</th><th>TÉL</th><th>STATUT</th><th>TYPE</th><th style="text-align:right">MAD</th></tr></thead>
  <tbody>
    ${rows}
    <tr class="tr"><td colspan="7">TOTAL GÉNÉRAL — ${orders.length} commandes</td><td style="text-align:right">${total.toFixed(2)} MAD</td></tr>
  </tbody>
</table>
<div class="footer">SchoolBox • Catalogue • Rapport généré le ${now} • Confidentiel</div>
</body></html>`;
}

// ── PDF BONS DE LIVRAISON CATALOGUE
function buildBonsPDF(orders: any[]) {
  const bySchool: any = {};
  orders.forEach(o => {
    const sName = o.student?.school?.name || 'Autre';
    if (!bySchool[sName]) bySchool[sName] = [];
    bySchool[sName].push(o);
  });
  const now = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });

  let bonsHtml = '';
  Object.entries(bySchool).forEach(([school, ords]: any) => {
    ords.forEach((o: any) => {
      const sc = SC[o.status] || SC['en_preparation'];
      const items = (o.items || []).map((item: any) => `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#1e293b;">${item.item_name}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:12px;text-align:center;">×${item.quantity}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:12px;text-align:right;font-weight:700;">${Number(item.unit_price * item.quantity).toFixed(2)} MAD</td>
        </tr>`).join('');

      bonsHtml += `
<div class="bon">
  <div class="header">
    <div class="logo">School<span>Box</span></div>
    <div class="title">BON DE LIVRAISON — CATALOGUE</div>
    <div style="font-size:10px;color:#64748b;margin-top:4px;">${now}</div>
    <div style="margin-top:6px;"><span class="status" style="background:${sc.bg};color:${sc.color};border:1px solid ${sc.border};">${sc.emoji} ${sc.label}</span></div>
  </div>

  <div class="path">🏫 ${school} › 📚 ${o.student?.level?.name || ''}${o.student?.class?.name ? ' › 📘 ' + o.student.class.name : ''}</div>

  <div class="section">
    <div class="label">👨‍🎓 Élève</div>
    <div class="value-big">${o.student?.full_name || '—'}</div>
    <div class="value" style="font-size:11px;color:#475569;margin-top:2px;">
      ${o.student?.school?.name || ''} — ${o.student?.level?.name || ''} ${o.student?.class?.name || ''}
    </div>
  </div>

  <div class="divider"></div>

  <div class="section">
    <div class="label">👤 Parent</div>
    <div class="value">${o.parent_code?.parent_name || '—'}</div>
  </div>

  <div class="section">
    <div class="label">📱 Téléphone</div>
    <div class="value-big" style="color:#1d4ed8;">${o.parent_code?.parent_phone || o.phone || '—'}</div>
  </div>

  ${o.address ? `
  <div class="section">
    <div class="label">📍 Adresse</div>
    <div class="value">${o.address}</div>
  </div>` : ''}

  <div class="divider"></div>

  <div class="section">
    <div class="label">🛍️ Articles</div>
    <table>
      <thead><tr><th>Article</th><th style="text-align:center">Qté</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${items}</tbody>
    </table>
    ${o.wrapping ? `<div style="font-size:10px;color:#f59e0b;font-weight:700;margin-top:6px;">🛡️ Protection cahiers incluse</div>` : ''}
  </div>

  <div class="divider"></div>

  <div class="row">
    <div class="label">💰 TOTAL</div>
    <div style="font-size:18px;font-weight:900;color:#0f2356;">${Number(o.total_price).toFixed(2)} MAD</div>
  </div>

  <div class="divider"></div>

  ${o.driverName ? `
  <div class="driver-box">
    <div class="driver-label">🚚 LIVREUR ASSIGNÉ</div>
    <div class="driver-name">${o.driverName}</div>
  </div>` : ''}

  <div class="cut-line">✂ - - - - - - - - - - - - - - -</div>

  <div class="footer">SchoolBox — Bon de livraison — ${now}</div>
</div>`;
    });
  });

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; padding: 12px; background: #f7f8fc; }
  .bon { width: 80mm; margin: 0 auto 24px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); page-break-inside: avoid; padding: 12px; }
  .header { text-align: center; border-bottom: 2px dashed #0f2356; padding-bottom: 10px; margin-bottom: 10px; }
  .logo { font-size: 22px; font-weight: 900; color: #0f2356; }
  .logo span { color: #ef4444; }
  .title { font-size: 11px; color: #64748b; margin-top: 3px; letter-spacing: 1px; }
  .path { font-size: 9px; color: #94a3b8; text-align: center; margin-bottom: 10px; background: #f8fafc; padding: 4px 8px; border-radius: 4px; }
  .section { margin-bottom: 10px; }
  .label { font-size: 9px; font-weight: 800; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 3px; }
  .value { font-size: 13px; font-weight: 700; color: #1e293b; }
  .value-big { font-size: 16px; font-weight: 900; color: #0f2356; }
  .divider { border-top: 1px dashed #e2e8f0; margin: 8px 0; }
  .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th { font-size: 9px; font-weight: 800; color: #94a3b8; padding: 4px 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
  .driver-box { background: #f0f9ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 8px; margin-bottom: 8px; }
  .driver-label { font-size: 9px; font-weight: 800; color: #3b82f6; letter-spacing: 1px; }
  .driver-name { font-size: 14px; font-weight: 900; color: #1d4ed8; }
  .cut-line { text-align: center; font-size: 10px; color: #94a3b8; margin: 6px 0; letter-spacing: 2px; }
  .footer { text-align: center; font-size: 9px; color: #94a3b8; padding-top: 8px; border-top: 1px dashed #e2e8f0; }
</style>
</head><body>
<div style="text-align:center;margin-bottom:16px;padding:12px;">
  <div style="font-size:22px;font-weight:900;color:#0f2356;">School<span style="color:#ef4444;">Box</span></div>
  <div style="font-size:11px;color:#718096;margin-top:4px;">BONS DE LIVRAISON CATALOGUE • ${now}</div>
</div>
${bonsHtml || '<div style="text-align:center;padding:40px;color:#94a3b8;">Aucun bon disponible</div>'}
</body></html>`;
}
export default function AdminOrders() {const { appUser } = useAuth();
  const [fournitureOrders, setFournitureOrders] = useState<any[]>([]);
  const [catalogueOrders,  setCatalogueOrders]  = useState<any[]>([]);
  const [libraries,        setLibraries]        = useState<any[]>([]);
  const [drivers,          setDrivers]          = useState<any[]>([]);
  const [driverMap,        setDriverMap]        = useState<{ [id: string]: string }>({});
  const [refreshing,       setRefreshing]       = useState(false);

  const [mainScreen,    setMainScreen]    = useState<MainScreen>('main');
  const [subScreen,     setSubScreen]     = useState<SubScreen>('libs');
  const [catalogueTab,  setCatalogueTab]  = useState<CatalogueTab>('prep');
  const [selLib,        setSelLib]        = useState<any>(null);
  const [selEcole,      setSelEcole]      = useState<any>(null);
  const [selNiveau,     setSelNiveau]     = useState('');
  const [selBranche,    setSelBranche]    = useState('');

  const [selOrder,    setSelOrder]    = useState<any>(null);
  const [showTicket,  setShowTicket]  = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDriver,  setShowDriver]  = useState(false);
  const [showRecu,    setShowRecu]    = useState(false);
  const [isBulk,      setIsBulk]      = useState(false);
  const [bulkIds,     setBulkIds]     = useState<string[]>([]);
  const [busy,        setBusy]        = useState(false);
  const [pdfBusy,     setPdfBusy]     = useState(false);

  const recuRef = useRef<any>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setRefreshing(true);
    try {
      const { data: fo } = await supabase
        .from('orders')
        .select(`
          id, status, type, total_price, created_at, address, phone,
          location_lat, location_lng, wrapping, driver_id, fourniture_id,
          student:students(full_name, school:schools(id,name,abbreviation), level:levels(name), class:classes(name)),
          parent_code:parent_codes(parent_name, parent_phone),
          items:order_items(item_name, unit_price, quantity),
          fourniture:fournitures(name, pdf_url)
        `)
        .eq('type', 'fourniture')
        .order('created_at', { ascending: false });
      setFournitureOrders(fo || []);

      const { data: co } = await supabase
        .from('orders')
        .select(`
          id, status, type, total_price, created_at, address, phone,
          location_lat, location_lng, wrapping, driver_id,
          student:students(full_name, school:schools(id,name,abbreviation), level:levels(name), class:classes(name)),
          parent_code:parent_codes(parent_name, parent_phone),
          items:order_items(item_name, unit_price, quantity, product_id)
        `)
        .eq('type', 'catalogue')
        .order('created_at', { ascending: false });

      const pids = [...new Set(
        (co||[]).flatMap((o:any)=>(o.items||[]).map((i:any)=>i.product_id).filter(Boolean))
      )] as string[];
      let prodMap:any={};
      if (pids.length) {
        const { data: prods } = await supabase.from('products').select('id,name,image_url').in('id',pids);
        prods?.forEach((p:any)=>{ prodMap[p.id]=p; });
      }
      setCatalogueOrders((co||[]).map((o:any)=>({
        ...o,
        items:(o.items||[]).map((item:any)=>({...item, product: prodMap[item.product_id]||null})),
      })));

      const { data: libs } = await supabase.from('libraries').select('id,name').eq('is_active',true);
      setLibraries(libs||[]);

      const { data: dr } = await supabase.from('app_users')
  .select('id,full_name,library_id,linked_admin_id')
  .eq('role','livreur')
  .eq('is_active',true);
      setDrivers(dr||[]);

      const allO = [...(fo||[]),...(co||[])];
      const dids = [...new Set(allO.map((o:any)=>o.driver_id).filter(Boolean))] as string[];
      if (dids.length) {
        const { data: di } = await supabase.from('app_users').select('id,full_name').in('id',dids);
        const dm:any={};
        di?.forEach((d:any)=>{ dm[d.id]=d.full_name; });
        setDriverMap(dm);
      }
    } catch(e){ console.error(e); }
    setRefreshing(false);
  }

  const cnt = (arr:any[]) => ({
    prep: arr.filter(o=>['en_preparation','pending','confirmed'].includes(o.status)).length,
    att:  arr.filter(o=>['en_attente','in_delivery'].includes(o.status)).length,
    liv:  arr.filter(o=>['livree','delivered'].includes(o.status)).length,
    ann:  arr.filter(o=>['annulee','failed'].includes(o.status)).length,
  });

  function fmt(d:string) {
    return new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});
  }

  const isFournitures = mainScreen === 'fournitures';
  const isCatalogue   = mainScreen === 'catalogue';

  // ── Catalogue tab filtering
  function getCatalogueTabOrders() {
    return catalogueOrders.filter(o => {
      if (catalogueTab === 'prep')    return ['en_preparation','pending','confirmed'].includes(o.status);
      if (catalogueTab === 'route')   return ['en_attente','in_delivery'].includes(o.status);
      if (catalogueTab === 'annulee') return ['annulee','failed'].includes(o.status);
      if (catalogueTab === 'livree')  return ['livree','delivered'].includes(o.status);
      return false;
    });
  }

  const catalogueCnt = {
    prep:    catalogueOrders.filter(o=>['en_preparation','pending','confirmed'].includes(o.status)).length,
    route:   catalogueOrders.filter(o=>['en_attente','in_delivery'].includes(o.status)).length,
    annulee: catalogueOrders.filter(o=>['annulee','failed'].includes(o.status)).length,
    livree:  catalogueOrders.filter(o=>['livree','delivered'].includes(o.status)).length,
  };

  const orders = isFournitures ? fournitureOrders : getCatalogueTabOrders();

  function ecolesForLib(_:string) {
    const m:any={};
    fournitureOrders.forEach(o=>{const sc=o.student?.school; if(sc) m[sc.id]=sc;});
    return Object.values(m);
  }
  function ecolesForCatalogueTab() {
    const m:any={};
    getCatalogueTabOrders().forEach(o=>{const sc=o.student?.school; if(sc) m[sc.id]=sc;});
    return Object.values(m);
  }
  function ordersForEcole(sid:string) { return orders.filter(o=>o.student?.school?.id===sid); }
  function niveauxForEcole(sid:string) { return [...new Set(ordersForEcole(sid).map((o:any)=>o.student?.level?.name).filter(Boolean))] as string[]; }
  function branchesForNiveau(sid:string,niv:string) {
    return [...new Set(ordersForEcole(sid).filter(o=>o.student?.level?.name===niv).map((o:any)=>o.student?.class?.name).filter(Boolean))] as string[];
  }
  function finalOrders(sid:string,niv:string,br:string) {
    return ordersForEcole(sid).filter(o=>o.student?.level?.name===niv&&(!br||o.student?.class?.name===br));
  }

  function goBack() {
    if (subScreen==='orders') {
      if (selBranche){setSelBranche('');setSubScreen('branches');}
      else{setSelNiveau('');setSubScreen('niveaux');}
    } else if(subScreen==='branches'){setSelNiveau('');setSubScreen('niveaux');}
    else if(subScreen==='niveaux'){setSelEcole(null);setSubScreen('ecoles');}
    else if(subScreen==='ecoles'){
      if(isFournitures){setSelLib(null);setSubScreen('libs');}
      else { setSubScreen('cases'); }
    }
    else if(subScreen==='libs') setMainScreen('main');
    else if(subScreen==='cases') setMainScreen('main');
  }

  async function changeStatus(orderId:string,newStatus:string) {
    setBusy(true);
    await supabase.from('orders').update({status:newStatus}).eq('id',orderId);
    setSelOrder((p:any)=>p?{...p,status:newStatus}:p);
    await load();
    setBusy(false);
  }

  async function retourEnPrepa(orderId:string) {
    setBusy(true);
    await supabase.from('orders').update({status:'en_preparation',driver_id:null}).eq('id',orderId);
    setSelOrder((p:any)=>p?{...p,status:'en_preparation',driver_id:null}:p);
    await load();
    setBusy(false);
    setShowTicket(false);
  }

  async function doAssign(driverId:string) {
    setBusy(true);
    const ids = isBulk ? bulkIds : [selOrder?.id];
    for (const id of ids) {
      await supabase.from('orders').update({driver_id:driverId,status:'en_attente'}).eq('id',id);
    }
    const { data: di } = await supabase.from('app_users').select('id,full_name').eq('id',driverId).single();
    if (di) setDriverMap(prev=>({...prev,[driverId]:di.full_name}));
    setSelOrder((p:any)=>p?{...p,driver_id:driverId,status:'en_attente'}:p);
    await load();
    setShowDriver(false);
    setShowTicket(false);
    setIsBulk(false);
    setBulkIds([]);
    setBusy(false);
    if (!isBulk && isCatalogue) {
      const driverName = di?.full_name || '';
      await shareRecuPDF(selOrder, driverName);
    } else if (!isBulk && !isCatalogue) {
      setShowRecu(true);
    }
  }

  function openBulk(arr:any[]) {
    const prep=arr.filter(o=>['en_preparation','pending','confirmed'].includes(o.status)).map((o:any)=>o.id);
    if (!prep.length){Alert.alert('Info','Aucune commande à envoyer');return;}
    setBulkIds(prep);setIsBulk(true);setShowDriver(true);
  }

  function callParent(phone:string){
    Alert.alert('Contacter le parent', phone, [
      { text: '📞 Appel', onPress: () => Linking.openURL(`tel:${phone}`) },
      { text: '💬 WhatsApp', onPress: () => {
        const p = phone.replace(/\D/g,'');
        const intl = p.startsWith('0') ? '212'+p.slice(1) : p;
        Linking.openURL(`https://wa.me/${intl}`);
      }},
      { text: 'Annuler', style: 'cancel' },
    ]);
  }

  async function shareRecuImage() {
    if (!recuRef.current) return;
    setBusy(true);
    try {
      const uri = await recuRef.current.capture();
      await Sharing.shareAsync(uri,{mimeType:'image/png',dialogTitle:'Partager le reçu'});
    } catch(e){console.error(e);}
    setBusy(false);
  }

  async function shareRecuPDF(order?: any, driverName?: string) {
    const ord = order || selOrder;
    if (!ord) return;
    setBusy(true);
    try {
      const name = driverName || driverMap[ord.driver_id] || '';
      const html = buildRecuHTML(ord, name);
      const { uri } = await Print.printToFileAsync({html,base64:false});
      await Sharing.shareAsync(uri,{mimeType:'application/pdf',dialogTitle:'Bon de livraison'});
    } catch(e){console.error(e);}
    setBusy(false);
  }

  async function exportStatsPDF() {
    setPdfBusy(true);
    try {
      const allO = [...fournitureOrders,...catalogueOrders];
      let filtered = allO;
      let label = 'Toutes commandes';
      if (selEcole)  { filtered=filtered.filter(o=>o.student?.school?.id===selEcole.id); label=selEcole.name; }
      if (selNiveau) { filtered=filtered.filter(o=>o.student?.level?.name===selNiveau); label+=' › '+selNiveau; }
      if (selBranche){ filtered=filtered.filter(o=>o.student?.class?.name===selBranche); label+=' › '+selBranche; }
      if (!filtered.length){Alert.alert('Info','Aucune commande');setPdfBusy(false);return;}
      const html = buildAllOrdersPDF(filtered,label);
      const { uri } = await Print.printToFileAsync({html,base64:false});
      await Sharing.shareAsync(uri,{mimeType:'application/pdf',dialogTitle:'Statistiques catalogue'});
    } catch(e){console.error(e);}
    setPdfBusy(false);
  }

  async function exportBonsPDF() {
    setPdfBusy(true);
    try {
      const orders = catalogueOrders.filter(o=>['en_attente','in_delivery'].includes(o.status));
      if (!orders.length){Alert.alert('Info','Aucun bon disponible (commandes en route)');setPdfBusy(false);return;}
      const ordersWithDriver = orders.map(o=>({...o, driverName: driverMap[o.driver_id]||''}));
      const html = buildBonsPDF(ordersWithDriver);
      const { uri } = await Print.printToFileAsync({html,base64:false});
      await Sharing.shareAsync(uri,{mimeType:'application/pdf',dialogTitle:'Bons de livraison'});
    } catch(e){console.error(e);}
    setPdfBusy(false);
  }

  function getHeaderTitle() {
    if (mainScreen==='main') return 'Commandes';
    if (subScreen==='libs')    return 'Fournitures — Librairies';
    if (subScreen==='cases')   return 'Catalogue';
    if (subScreen==='ecoles')  {
      if (isFournitures) return selLib?.name || 'Écoles';
      const tabLabels: Record<CatalogueTab,string> = { prep:'⏳ En préparation', route:'🚚 En route', annulee:'❌ Annulées', livree:'✅ Livrées' };
      return tabLabels[catalogueTab];
    }
    if (subScreen==='niveaux')  return selEcole?.name||'';
    if (subScreen==='branches') return selNiveau;
    if (subScreen==='orders')   return selBranche||selNiveau;
    return '';
  }
  function getHeaderSub() {
    if (mainScreen==='main') return `${fournitureOrders.length+catalogueOrders.length} commandes`;
    const c=selEcole&&selNiveau?finalOrders(selEcole.id,selNiveau,selBranche):selEcole?ordersForEcole(selEcole.id):[];
    return c.length?`${c.length} commandes`:'';
  }

  // ── HEADER
  const Header = () => (
    <View style={s.header}>
      <View style={s.decCircle1}/><View style={s.decCircle2}/>
      <View style={s.headerRow}>
        {mainScreen!=='main'&&<TouchableOpacity style={s.backBtn} onPress={goBack}><IconBack size={20}/></TouchableOpacity>}
        <View style={{flex:1}}>
          <Text style={s.headerTitle}>{getHeaderTitle()}</Text>
          {getHeaderSub()?<Text style={s.headerSub}>{getHeaderSub()}</Text>:null}
        </View>
        {(subScreen!=='cases'&&mainScreen!=='catalogue') && (
          <TouchableOpacity style={s.pdfBtn} onPress={exportStatsPDF} disabled={pdfBusy}>
            {pdfBusy?<ActivityIndicator size="small" color="white"/>:<><IconPDF size={13} color="white"/><Text style={s.pdfBtnTxt}>PDF</Text></>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const BulkBtn = ({arr,label}:{arr:any[];label:string}) => {
    if (!isCatalogue) return null;
    const n=arr.filter(o=>['en_preparation','pending','confirmed'].includes(o.status)).length;
    if (!n) return null;
    return (
      <TouchableOpacity style={s.bulkBtn} onPress={()=>openBulk(arr)} activeOpacity={0.88}>
        <View style={s.bulkIcon}><IconTruck size={16} color={NAV}/></View>
        <Text style={s.bulkTxt}>Envoyer {n} commande{n>1?'s':''} — {label}</Text>
        <View style={s.bulkBadge}><Text style={s.bulkBadgeTxt}>{n}</Text></View>
      </TouchableOpacity>
    );
  };

  const OrderCard = ({order}:{order:any}) => {
    const sc=SC[order.status]||SC['en_preparation'];
    return (
      <TouchableOpacity style={s.orderCard} onPress={()=>{setSelOrder(order);setShowTicket(true);}} activeOpacity={0.88}>
        <View style={[s.orderStripe,{backgroundColor:sc.color}]}/>
        <View style={{flex:1,padding:13}}>
          <View style={s.orderTop}>
            <Text style={s.orderName} numberOfLines={1}>{order.student?.full_name}</Text>
            <View style={[s.statusPill,{backgroundColor:sc.bg,borderColor:sc.border}]}>
              <Text style={[s.statusPillTxt,{color:sc.color}]}>{sc.emoji} {sc.label}</Text>
            </View>
          </View>
          <Text style={s.orderDate}>{fmt(order.created_at)}</Text>
          <View style={s.orderFoot}>
            <Text style={s.orderParent}>👤 {order.parent_code?.parent_name}</Text>
            {order.location_lat&&<Text style={[s.orderTag,{color:RED}]}>📍 GPS</Text>}
            {order.driver_id&&<View style={s.driverMini}><Text style={s.driverMiniTxt}>🚚 {driverMap[order.driver_id]||'...'}</Text></View>}
            <Text style={s.orderPrice}>{Number(order.total_price).toFixed(2)} MAD</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── TICKET MODAL
  const TicketModal = () => {
    if (!selOrder) return null;
    const sc=SC[selOrder.status]||SC['en_preparation'];
    const isCat=selOrder.type==='catalogue';
    const st=selOrder.status;
    const isPrep    = ['en_preparation','pending','confirmed'].includes(st);
    const isRoute   = ['en_attente','in_delivery'].includes(st);
    const isAnnulee = ['annulee','failed'].includes(st);
    const isLivree  = ['livree','delivered'].includes(st);
    const phone=selOrder.phone||selOrder.parent_code?.parent_phone;

    return (
      <Modal visible={showTicket} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHandle}/>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[s.ticketStatus,{borderBottomColor:sc.color}]}>
                <View style={[s.ticketStatusDot,{backgroundColor:sc.color}]}/>
                <Text style={[s.ticketStatusTxt,{color:sc.color}]}>{sc.emoji}  {sc.label}</Text>
                <View style={[s.ticketTypePill,{backgroundColor:isCat?'#ffedd5':'#ede9fe',borderColor:isCat?'#fdba74':'#c4b5fd'}]}>
                  <Text style={[s.ticketTypeTxt,{color:isCat?'#ea580c':'#7c3aed'}]}>{isCat?'🛍️ Catalogue':'📋 Fourniture'}</Text>
                </View>
              </View>

              <View style={s.prodBanner}>
                <View style={[s.prodIcon,{backgroundColor:isCat?'#ffedd5':'#ede9fe'}]}>
                  <Text style={{fontSize:28}}>{isCat?'🛍️':'📦'}</Text>
                </View>
                <View style={{flex:1}}>
                  <Text style={s.prodName}>{isCat?'Commande catalogue':(selOrder.fourniture?.name||'Fourniture')}</Text>
                  <Text style={s.prodMeta}>{selOrder.items?.length||0} article(s)  •  {Number(selOrder.total_price).toFixed(2)} MAD</Text>
                </View>
                <Text style={s.prodDate}>{fmt(selOrder.created_at)}</Text>
              </View>

              <View style={s.ticketBody}>
                {/* Élève */}
                <View style={s.infoCard}>
                  <View style={s.infoCardHead}><View style={[s.infoDot,{backgroundColor:NAV2}]}/><Text style={s.infoCardLbl}>ÉLÈVE</Text></View>
                  <Text style={s.infoName}>{selOrder.student?.full_name}</Text>
                  <Text style={s.infoSub}>🏫  {selOrder.student?.school?.name}</Text>
                  <Text style={s.infoSub}>📚  {selOrder.student?.level?.name}{selOrder.student?.class?.name?` — ${selOrder.student.class.name}`:''}</Text>
                </View>

                {/* Parent */}
                <View style={s.infoCard}>
                  <View style={s.infoCardHead}><View style={[s.infoDot,{backgroundColor:BLUE}]}/><Text style={s.infoCardLbl}>PARENT</Text></View>
                  <Text style={s.infoName}>{selOrder.parent_code?.parent_name}</Text>
                  <Text style={s.infoSub}>📞  {selOrder.parent_code?.parent_phone}</Text>
                  {selOrder.phone&&<Text style={s.infoSub}>📱  {selOrder.phone}</Text>}
                  {selOrder.address&&<Text style={s.infoSub}>📍  {selOrder.address}</Text>}
                  {phone&&(
                    <View style={s.contactBtns}>
                      <TouchableOpacity style={s.callBtn} onPress={()=>callParent(phone)}>
                        <IconPhone size={14} color="white"/><Text style={s.callBtnTxt}>Appel / WhatsApp</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Maps + PDF */}
                {(selOrder.location_lat||selOrder.fourniture?.pdf_url)&&(
                  <View style={s.quickBtns}>
                    {selOrder.location_lat&&(
                      <TouchableOpacity style={s.qBtnMap} onPress={()=>Linking.openURL(`https://maps.google.com/?q=${selOrder.location_lat},${selOrder.location_lng}`)}>
                        <IconMap size={15} color="white"/><Text style={s.qBtnTxt}>Google Maps</Text>
                      </TouchableOpacity>
                    )}
                    {selOrder.fourniture?.pdf_url&&(
                      <TouchableOpacity style={s.qBtnPDF} onPress={()=>Linking.openURL(selOrder.fourniture.pdf_url)}>
                        <IconPDF size={15} color="white"/><Text style={s.qBtnTxt}>Liste PDF</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Articles */}
                <View style={s.infoCard}>
                  <View style={s.infoCardHead}><View style={[s.infoDot,{backgroundColor:ORANGE}]}/><Text style={s.infoCardLbl}>ARTICLES</Text></View>
                  {selOrder.items?.map((item:any,i:number)=>(
                    <View key={i} style={[s.articleRow,i<selOrder.items.length-1&&{borderBottomWidth:1,borderBottomColor:'#f3f4f6'}]}>
                      {isCat&&item.product?.image_url&&<Image source={{uri:item.product.image_url}} style={s.articleImg}/>}
                      <Text style={s.articleName} numberOfLines={2}>{item.item_name}</Text>
                      <View style={s.articleRight}>
                        <View style={s.articleQty}><Text style={s.articleQtyTxt}>×{item.quantity}</Text></View>
                        <Text style={s.articlePrice}>{Number(item.unit_price*item.quantity).toFixed(2)} MAD</Text>
                      </View>
                    </View>
                  ))}
                  {selOrder.wrapping&&<View style={s.articleRow}><Text style={[s.articleName,{color:ORANGE}]}>🛡️ Protection cahiers</Text></View>}
                </View>

                <View style={s.totalBar}>
                  <Text style={s.totalLbl}>TOTAL</Text>
                  <Text style={s.totalAmt}>{Number(selOrder.total_price).toFixed(2)} MAD</Text>
                </View>

                {selOrder.driver_id&&(
                  <View style={s.driverBanner}>
                    <Text style={{fontSize:20}}>🚚</Text>
                    <View style={{flex:1}}>
                      <Text style={s.driverBannerName}>{driverMap[selOrder.driver_id]||'...'}</Text>
                      <Text style={s.driverBannerSub}>Livreur assigné</Text>
                    </View>
                  </View>
                )}

                {/* ── FOURNITURE: observe only + annuler ── */}
                {!isCat&&(
                  <View style={s.observeNote}>
                    <Text style={{fontSize:18}}>👁️</Text>
                    <Text style={s.observeNoteTxt}>Gérée par la librairie — observation uniquement.</Text>
                  </View>
                )}
                {!isCat&&!isLivree&&!isAnnulee&&(
                  <View style={s.actionsBox}>
                    <TouchableOpacity style={s.btnRed} onPress={()=>Alert.alert('Annuler','Confirmer ?',[
                      {text:'Non',style:'cancel'},
                      {text:'Oui',style:'destructive',onPress:()=>{changeStatus(selOrder.id,'annulee');setShowTicket(false);}},
                    ])} disabled={busy}>
                      <IconX size={15} color={RED}/><Text style={s.btnRedTxt}>Annuler la commande</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* ── CATALOGUE ACTIONS ── */}
                {isCat&&(
                  <View style={s.actionsBox}>

                    {/* EN PREPARATION */}
                    {isPrep&&(
                      <>
                        <TouchableOpacity style={s.btnNavy} onPress={()=>{setShowTicket(false);setShowConfirm(true);}} disabled={busy}>
                          <IconCheck size={17} color="white"/><Text style={s.btnTxt}>Confirmer la commande</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.btnRed} onPress={()=>Alert.alert('Annuler','Confirmer ?',[
                          {text:'Non',style:'cancel'},
                          {text:'Oui',style:'destructive',onPress:()=>{changeStatus(selOrder.id,'annulee');setShowTicket(false);}},
                        ])} disabled={busy}>
                          <IconX size={15} color={RED}/><Text style={s.btnRedTxt}>Annuler la commande</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {/* EN ROUTE */}
                    {isRoute&&(
                      <>
                        <TouchableOpacity style={s.btnBlue} onPress={()=>{setIsBulk(false);setShowDriver(true);}} disabled={busy}>
                          <IconTruck size={17} color="white"/><Text style={s.btnTxt}>Changer le livreur</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.btnGray} onPress={()=>Alert.alert('Retour en préparation','Confirmer ?',[
                          {text:'Non',style:'cancel'},
                          {text:'Oui',onPress:()=>retourEnPrepa(selOrder.id)},
                        ])} disabled={busy}>
                          <Text style={s.btnGrayTxt}>↩️ Retour en préparation</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.btnRed} onPress={()=>Alert.alert('Annuler','Confirmer ?',[
                          {text:'Non',style:'cancel'},
                          {text:'Oui',style:'destructive',onPress:()=>{changeStatus(selOrder.id,'annulee');setShowTicket(false);}},
                        ])} disabled={busy}>
                          <IconX size={15} color={RED}/><Text style={s.btnRedTxt}>Annuler la commande</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {/* ANNULEE */}
                    {isAnnulee&&(
                      <TouchableOpacity style={s.btnGray} onPress={()=>Alert.alert('Restaurer','Remettre en préparation ?',[
                        {text:'Non',style:'cancel'},
                        {text:'Oui',onPress:()=>{changeStatus(selOrder.id,'en_preparation');setShowTicket(false);}},
                      ])} disabled={busy}>
                        <Text style={s.btnGrayTxt}>↩️ Annuler l'annulation</Text>
                      </TouchableOpacity>
                    )}

                    {/* LIVREE: readonly */}
                    {isLivree&&(
                      <View style={s.livreedNote}>
                        <Text style={{fontSize:18}}>✅</Text>
                        <Text style={s.livreedTxt}>Commande livrée avec succès.</Text>
                      </View>
                    )}
                  </View>
                )}

                <TouchableOpacity style={s.btnClose} onPress={()=>setShowTicket(false)}>
                  <Text style={s.btnCloseTxt}>Fermer</Text>
                </TouchableOpacity>
                <View style={{height:40}}/>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // ── CONFIRM MODAL
  const ConfirmModal = () => {
    if (!selOrder) return null;
    const phone=selOrder.phone||selOrder.parent_code?.parent_phone;
    return (
      <Modal visible={showConfirm} animationType="fade" transparent>
        <View style={s.overlayCenter}>
          <View style={s.confirmBox}>
            <View style={s.confirmIcon}><Text style={{fontSize:36}}>🛍️</Text></View>
            <Text style={s.confirmTitle}>Confirmer la commande ?</Text>
            <Text style={s.confirmSub}>{selOrder.student?.full_name}</Text>
            <Text style={[s.confirmSub,{color:TEXT3,fontSize:12,marginTop:2}]}>
              {selOrder.student?.school?.name} • {selOrder.student?.level?.name}
            </Text>
            <Text style={[s.confirmSub,{color:NAV,fontWeight:'900',fontSize:17,marginTop:6}]}>
              {Number(selOrder.total_price).toFixed(2)} MAD
            </Text>
            {phone&&(
              <View style={s.contactBtns}>
                <TouchableOpacity style={s.callBtn} onPress={()=>callParent(phone)}>
                  <IconPhone size={14} color="white"/><Text style={s.callBtnTxt}>Appel / WhatsApp</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{gap:10,width:'100%',marginTop:16}}>
              <TouchableOpacity style={s.btnNavy} onPress={async()=>{
                setShowConfirm(false);
                await changeStatus(selOrder.id,'confirmed');
                setShowDriver(true);
              }} disabled={busy}>
                {busy?<ActivityIndicator color="white"/>:<><IconCheck size={17} color="white"/><Text style={s.btnTxt}>Confirmer ✅</Text></>}
              </TouchableOpacity>
              <TouchableOpacity style={s.btnRed} onPress={()=>{setShowConfirm(false);changeStatus(selOrder.id,'annulee');}} disabled={busy}>
                <IconX size={15} color={RED}/><Text style={s.btnRedTxt}>Annuler la commande</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnClose} onPress={()=>setShowConfirm(false)}>
                <Text style={s.btnCloseTxt}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ── DRIVER MODAL
  const DriverModal = () => {
    const filteredDrivers = drivers.filter(d =>
  d.linked_admin_id === appUser?.id
);
    return (
      <Modal visible={showDriver} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={[s.sheet,{maxHeight:'55%'}]}>
            <View style={s.sheetHandle}/>
            <View style={s.driverModalHead}>
              <Text style={s.driverModalTitle}>🚚  Choisir un livreur</Text>
              {isBulk&&<View style={s.bulkBadge}><Text style={s.bulkBadgeTxt}>{bulkIds.length} cmd</Text></View>}
            </View>
            {filteredDrivers.length===0
              ?<View style={s.noDriver}><Text style={s.noDriverTxt}>⚠️  Aucun livreur disponible</Text></View>
              :<ScrollView style={{paddingHorizontal:20}}>
                {filteredDrivers.map(d=>(
                  <TouchableOpacity key={d.id} style={s.driverItem} onPress={()=>doAssign(d.id)} disabled={busy}>
                    <View style={s.driverAvatar}><Text style={s.driverAvatarTxt}>{d.full_name[0].toUpperCase()}</Text></View>
                    <View style={{flex:1}}>
                      <Text style={s.driverName}>{d.full_name}</Text>
                      <Text style={s.driverRole}>Livreur</Text>
                    </View>
                    {busy?<ActivityIndicator size="small" color={NAV}/>:<IconChevron size={14} color={NAV}/>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            }
            <TouchableOpacity style={[s.btnClose,{marginHorizontal:20,marginTop:8}]} onPress={()=>{setShowDriver(false);setIsBulk(false);}}>
              <Text style={s.btnCloseTxt}>Fermer</Text>
            </TouchableOpacity>
            <View style={{height:24}}/>
          </View>
        </View>
      </Modal>
    );
  };

  // ── REÇU MODAL (fournitures only)
  const RecuModal = () => {
    if (!selOrder) return null;
    const sc=SC[selOrder.status]||SC['en_preparation'];
    const isCat=selOrder.type==='catalogue';
    const driverName=driverMap[selOrder.driver_id]||'';
    return (
      <Modal visible={showRecu} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={[s.sheet,{maxHeight:'92%'}]}>
            <View style={s.sheetHandle}/>
            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingTop:10,paddingBottom:4}}>
              <Text style={{fontSize:18,fontWeight:'900',color:TEXT}}>🧾  Reçu</Text>
              <TouchableOpacity onPress={()=>setShowRecu(false)}><Text style={{color:TEXT2,fontWeight:'800'}}>Fermer</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:20}}>
              <ViewShot ref={recuRef} options={{format:'png',quality:1}} style={{margin:16}}>
                <View style={s.recuCard}>
                  <View style={s.recuHeader}>
                    <View style={s.decCircle1}/><View style={s.decCircle2}/>
                    <View style={s.recuLogoRow}>
                      <View style={s.recuLogoBox}><Text style={s.recuLogoTxt}>SB</Text></View>
                      <View>
                        <Text style={s.recuBrand}>SchoolBox</Text>
                        <Text style={s.recuBrandSub}>REÇU DE COMMANDE</Text>
                      </View>
                    </View>
                    <Text style={s.recuRef}>Réf: {selOrder.id.substring(0,8).toUpperCase()}</Text>
                    <Text style={s.recuDate}>📅 {fmt(selOrder.created_at)}</Text>
                    <View style={[s.statusPill,{backgroundColor:sc.bg,borderColor:sc.border,marginTop:8,alignSelf:'flex-start' as any}]}>
                      <Text style={[s.statusPillTxt,{color:sc.color}]}>{sc.emoji} {sc.label}</Text>
                    </View>
                  </View>
                  <View style={{padding:16}}>
                    <View style={s.recuSection}>
                      <Text style={s.infoName}>{selOrder.student?.full_name}</Text>
                      <Text style={s.infoSub}>🏫  {selOrder.student?.school?.name}</Text>
                    </View>
                    <View style={s.recuSection}>
                      <Text style={s.infoName}>{selOrder.parent_code?.parent_name}</Text>
                      <Text style={s.infoSub}>📞  {selOrder.parent_code?.parent_phone}</Text>
                      {selOrder.address&&<Text style={s.infoSub}>📍  {selOrder.address}</Text>}
                    </View>
                    <View style={s.totalBar}>
                      <Text style={s.totalLbl}>TOTAL</Text>
                      <Text style={s.totalAmt}>{Number(selOrder.total_price).toFixed(2)} MAD</Text>
                    </View>
                    {driverName&&(
                      <View style={s.driverBanner}>
                        <Text style={{fontSize:18}}>🚚</Text>
                        <View style={{flex:1}}>
                          <Text style={s.driverBannerName}>{driverName}</Text>
                          <Text style={s.driverBannerSub}>Livreur assigné</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </ViewShot>
              <View style={{paddingHorizontal:20,gap:10}}>
                <TouchableOpacity style={s.btnNavy} onPress={shareRecuImage} disabled={busy}>
                  {busy?<ActivityIndicator color="white"/>:<><IconShare size={16} color="white"/><Text style={s.btnTxt}>Partager en image</Text></>}
                </TouchableOpacity>
                <TouchableOpacity style={[s.btnNavy,{backgroundColor:'#1d4ed8'}]} onPress={()=>shareRecuPDF()} disabled={busy}>
                  {busy?<ActivityIndicator color="white"/>:<><IconPDF size={16} color="white"/><Text style={s.btnTxt}>Partager en PDF</Text></>}
                </TouchableOpacity>
                <TouchableOpacity style={s.btnClose} onPress={()=>setShowRecu(false)}>
                  <Text style={s.btnCloseTxt}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const AllModals = () => <><TicketModal/><ConfirmModal/><DriverModal/><RecuModal/></>;

  // ════════════════════════════════
  // ── MAIN
  // ════════════════════════════════
  if (mainScreen==='main') {
    const totF=cnt(fournitureOrders);
    const totC=cnt(catalogueOrders);
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor={NAV}/>
        <Header/>
        <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={NAV} colors={[NAV]}/>} showsVerticalScrollIndicator={false}>
          <Text style={s.secTitle}>📊  Statistiques</Text>
          <View style={s.statsGrid}>
            <View style={s.statsCol}>
              <View style={s.statsColHead}><Text style={s.statsColTitle}>📋 Fournitures</Text><Text style={s.statsColTotal}>{fournitureOrders.length}</Text></View>
              <View style={s.statsRow2}>
                <View style={[s.statCard2,{backgroundColor:'#fef3c7',borderColor:'#fcd34d'}]}><Text style={s.statEmoji2}>⏳</Text><Text style={[s.statNum2,{color:ORANGE}]}>{totF.prep}</Text></View>
                <View style={[s.statCard2,{backgroundColor:'#dbeafe',borderColor:'#93c5fd'}]}><Text style={s.statEmoji2}>🚚</Text><Text style={[s.statNum2,{color:BLUE}]}>{totF.att}</Text></View>
                <View style={[s.statCard2,{backgroundColor:'#dcfce7',borderColor:'#86efac'}]}><Text style={s.statEmoji2}>✅</Text><Text style={[s.statNum2,{color:GREEN}]}>{totF.liv}</Text></View>
                <View style={[s.statCard2,{backgroundColor:'#fee2e2',borderColor:'#fca5a5'}]}><Text style={s.statEmoji2}>❌</Text><Text style={[s.statNum2,{color:RED}]}>{totF.ann}</Text></View>
              </View>
            </View>
            <View style={s.statsCol}>
              <View style={s.statsColHead}><Text style={s.statsColTitle}>🛍️ Catalogue</Text><Text style={s.statsColTotal}>{catalogueOrders.length}</Text></View>
              <View style={s.statsRow2}>
                <View style={[s.statCard2,{backgroundColor:'#fef3c7',borderColor:'#fcd34d'}]}><Text style={s.statEmoji2}>⏳</Text><Text style={[s.statNum2,{color:ORANGE}]}>{totC.prep}</Text></View>
                <View style={[s.statCard2,{backgroundColor:'#dbeafe',borderColor:'#93c5fd'}]}><Text style={s.statEmoji2}>🚚</Text><Text style={[s.statNum2,{color:BLUE}]}>{totC.att}</Text></View>
                <View style={[s.statCard2,{backgroundColor:'#dcfce7',borderColor:'#86efac'}]}><Text style={s.statEmoji2}>✅</Text><Text style={[s.statNum2,{color:GREEN}]}>{totC.liv}</Text></View>
                <View style={[s.statCard2,{backgroundColor:'#fee2e2',borderColor:'#fca5a5'}]}><Text style={s.statEmoji2}>❌</Text><Text style={[s.statNum2,{color:RED}]}>{totC.ann}</Text></View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={s.mainCard} onPress={()=>{setMainScreen('fournitures');setSubScreen('libs');}} activeOpacity={0.88}>
            <View style={s.mainCardLeft}>
              <View style={[s.mainCardIcon,{backgroundColor:'#ede9fe'}]}><Text style={{fontSize:32}}>📋</Text></View>
              <View style={{flex:1}}>
                <Text style={s.mainCardTitle}>Fournitures</Text>
                <Text style={s.mainCardSub}>{fournitureOrders.length} commandes  •  {libraries.length} librairies</Text>
                <MiniBadges c={totF}/>
              </View>
            </View>
            <View style={s.mainCardArrow}><IconChevron size={18} color={PURPLE}/></View>
          </TouchableOpacity>

          <TouchableOpacity style={s.mainCard} onPress={()=>{setMainScreen('catalogue');setSubScreen('cases');}} activeOpacity={0.88}>
            <View style={s.mainCardLeft}>
              <View style={[s.mainCardIcon,{backgroundColor:'#ffedd5'}]}><Text style={{fontSize:32}}>🛍️</Text></View>
              <View style={{flex:1}}>
                <Text style={s.mainCardTitle}>Catalogue</Text>
                <Text style={s.mainCardSub}>{catalogueOrders.length} commandes</Text>
                <MiniBadges c={totC}/>
              </View>
            </View>
            <View style={[s.mainCardArrow,{backgroundColor:'#ffedd5'}]}><IconChevron size={18} color="#ea580c"/></View>
          </TouchableOpacity>
          <View style={{height:32}}/>
        </ScrollView>
        <AllModals/>
      </View>
    );
  }

  // ── LIBS (fournitures)
  if (mainScreen==='fournitures'&&subScreen==='libs') {
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor={NAV}/>
        <Header/>
        <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={NAV} colors={[NAV]}/>} showsVerticalScrollIndicator={false}>
          <Text style={s.secTitle}>📚  Librairies</Text>
          {libraries.map(lib=>{
            const lc=cnt(fournitureOrders.filter(o=>true));
            return (
              <TouchableOpacity key={lib.id} style={s.listCard} onPress={()=>{setSelLib(lib);setSubScreen('ecoles');}} activeOpacity={0.88}>
                <View style={s.listCardGlow}/>
                <View style={s.listIconBox}><Text style={{fontSize:26}}>📚</Text></View>
                <View style={{flex:1}}>
                  <Text style={s.listCardTitle}>{lib.name}</Text>
                  <MiniBadges c={lc}/>
                </View>
                <View style={s.arrowBox}><IconChevron size={16} color={PURPLE}/></View>
              </TouchableOpacity>
            );
          })}
          <View style={{height:32}}/>
        </ScrollView>
        <AllModals/>
      </View>
    );
  }

  // ── CATALOGUE CASES (4 cases)
  if (mainScreen==='catalogue'&&subScreen==='cases') {
    const CASES = [
      { key:'prep',    label:'En préparation', emoji:'⏳', color:ORANGE, bg:'#fef3c7', border:'#fcd34d', count:catalogueCnt.prep    },
      { key:'route',   label:'En route',        emoji:'🚚', color:BLUE,   bg:'#dbeafe', border:'#93c5fd', count:catalogueCnt.route   },
      { key:'annulee', label:'Annulées',         emoji:'❌', color:RED,    bg:'#fee2e2', border:'#fca5a5', count:catalogueCnt.annulee },
      { key:'livree',  label:'Livrées',          emoji:'✅', color:GREEN,  bg:'#dcfce7', border:'#86efac', count:catalogueCnt.livree  },
    ];
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor={NAV}/>
        <Header/>
        <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={NAV} colors={[NAV]}/>} showsVerticalScrollIndicator={false}>
          {/* 2 PDF buttons */}
          <View style={{flexDirection:'row',gap:10,marginBottom:16}}>
            <TouchableOpacity style={[s.pdfActionBtn,{backgroundColor:NAV}]} onPress={exportStatsPDF} disabled={pdfBusy} activeOpacity={0.88}>
              {pdfBusy?<ActivityIndicator color="white" size="small"/>:<><IconPDF size={15} color="white"/><Text style={s.pdfActionTxt}>PDF Statistiques</Text></>}
            </TouchableOpacity>
            <TouchableOpacity style={[s.pdfActionBtn,{backgroundColor:PURPLE}]} onPress={exportBonsPDF} disabled={pdfBusy} activeOpacity={0.88}>
              {pdfBusy?<ActivityIndicator color="white" size="small"/>:<><IconTruck size={15} color="white"/><Text style={s.pdfActionTxt}>Bons PDF</Text></>}
            </TouchableOpacity>
          </View>

          <Text style={s.secTitle}>🛍️  COMMANDES CATALOGUE</Text>
          <View style={s.casesGrid}>
            {CASES.map(c=>(
              <TouchableOpacity key={c.key} style={[s.caseCard,{backgroundColor:c.bg,borderColor:c.border}]}
                onPress={()=>{ setCatalogueTab(c.key as CatalogueTab); setSubScreen('ecoles'); setSelEcole(null); setSelNiveau(''); setSelBranche(''); }}
                activeOpacity={0.88}>
                <Text style={{fontSize:34}}>{c.emoji}</Text>
                <Text style={[s.caseCount,{color:c.color}]}>{c.count}</Text>
                <Text style={[s.caseLabel,{color:c.color}]}>{c.label}</Text>
                <View style={[s.caseArrow,{borderColor:c.color+'40'}]}><IconChevron size={14} color={c.color}/></View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{height:32}}/>
        </ScrollView>
        <AllModals/>
      </View>
    );
  }

  // ── ÉCOLES
  if (subScreen==='ecoles') {
    const ecoles:any[] = isFournitures ? ecolesForLib(selLib?.id) : ecolesForCatalogueTab();
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor={NAV}/>
        <Header/>
        <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={NAV} colors={[NAV]}/>} showsVerticalScrollIndicator={false}>
          {isCatalogue&&<BulkBtn arr={getCatalogueTabOrders()} label="toutes les écoles"/>}
          <Text style={s.secTitle}>🏫  Écoles</Text>
          {ecoles.map((ec:any)=>{
            const ec2=cnt(ordersForEcole(ec.id));
            return (
              <TouchableOpacity key={ec.id} style={s.listCard} onPress={()=>{setSelEcole(ec);setSubScreen('niveaux');}} activeOpacity={0.88}>
                <View style={s.listCardGlow}/>
                <View style={s.listIconBox}><Text style={{fontSize:24}}>🏫</Text></View>
                <View style={{flex:1}}>
                  <Text style={s.listCardTitle}>{ec.name}</Text>
                  {ec.abbreviation&&<Text style={s.listCardSub}>{ec.abbreviation}</Text>}
                  <MiniBadges c={ec2}/>
                </View>
                <View style={s.arrowBox}><IconChevron size={16} color={NAV}/></View>
              </TouchableOpacity>
            );
          })}
          <View style={{height:32}}/>
        </ScrollView>
        <AllModals/>
      </View>
    );
  }

  // ── NIVEAUX
  if (subScreen==='niveaux'&&selEcole) {
    const nivs=niveauxForEcole(selEcole.id);
    const allEc=ordersForEcole(selEcole.id);
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor={NAV}/>
        <Header/>
        <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={NAV} colors={[NAV]}/>} showsVerticalScrollIndicator={false}>
          <BulkBtn arr={allEc} label={selEcole.name}/>
          <Text style={s.secTitle}>📚  Niveaux</Text>
          {nivs.map(niv=>{
            const no=allEc.filter(o=>o.student?.level?.name===niv);
            const nc=cnt(no);
            const brs=branchesForNiveau(selEcole.id,niv);
            return (
              <TouchableOpacity key={niv} style={s.niveauCard} onPress={()=>{setSelNiveau(niv);setSubScreen(brs.length?'branches':'orders');}} activeOpacity={0.88}>
                <View style={s.niveauBox}><Text style={s.niveauTxt}>{niv}</Text></View>
                <View style={{flex:1}}>
                  <Text style={s.niveauMeta}>{brs.length} branche{brs.length!==1?'s':''}  •  {no.length} cmd</Text>
                  <MiniBadges c={nc}/>
                </View>
                <IconChevron size={16} color={TEXT3}/>
              </TouchableOpacity>
            );
          })}
          <View style={{height:32}}/>
        </ScrollView>
        <AllModals/>
      </View>
    );
  }

  // ── BRANCHES
  if (subScreen==='branches'&&selEcole&&selNiveau) {
    const brs=branchesForNiveau(selEcole.id,selNiveau);
    const nivOrders=ordersForEcole(selEcole.id).filter(o=>o.student?.level?.name===selNiveau);
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor={NAV}/>
        <Header/>
        <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={NAV} colors={[NAV]}/>} showsVerticalScrollIndicator={false}>
          <BulkBtn arr={nivOrders} label={selNiveau}/>
          <Text style={s.secTitle}>📂  Branches</Text>
          {brs.map(br=>{
            const bo=finalOrders(selEcole.id,selNiveau,br);
            const bc=cnt(bo);
            return (
              <TouchableOpacity key={br} style={s.listCard} onPress={()=>{setSelBranche(br);setSubScreen('orders');}} activeOpacity={0.88}>
                <View style={s.listIconBox}><Text style={{fontSize:22}}>📘</Text></View>
                <View style={{flex:1}}>
                  <Text style={s.listCardTitle}>{br}</Text>
                  <Text style={s.listCardSub}>{bo.length} commande{bo.length!==1?'s':''}</Text>
                  <MiniBadges c={bc}/>
                </View>
                <View style={s.arrowBox}><IconChevron size={16} color={NAV}/></View>
              </TouchableOpacity>
            );
          })}
          <View style={{height:32}}/>
        </ScrollView>
        <AllModals/>
      </View>
    );
  }

  // ── ORDERS LIST
  if (subScreen==='orders'&&selEcole&&selNiveau) {
    const curOrders=finalOrders(selEcole.id,selNiveau,selBranche);
    const curCnt=cnt(curOrders);
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor={NAV}/>
        <Header/>
        <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={NAV} colors={[NAV]}/>} showsVerticalScrollIndicator={false}>
          <View style={s.statsRow}>
            {[
              {e:'⏳',n:curCnt.prep,c:ORANGE,bg:'#fef3c7',border:'#fcd34d'},
              {e:'🚚',n:curCnt.att, c:BLUE,  bg:'#dbeafe',border:'#93c5fd'},
              {e:'✅',n:curCnt.liv, c:GREEN, bg:'#dcfce7',border:'#86efac'},
              {e:'❌',n:curCnt.ann, c:RED,   bg:'#fee2e2',border:'#fca5a5'},
            ].map(({e,n,c,bg,border})=>(
              <View key={e} style={[s.statCard,{backgroundColor:bg,borderColor:border}]}>
                <Text style={s.statEmoji}>{e}</Text>
                <Text style={[s.statNum,{color:c}]}>{n}</Text>
              </View>
            ))}
          </View>
          <BulkBtn arr={curOrders} label={selBranche||selNiveau}/>
          {curOrders.length===0
            ?<View style={s.empty}><Text style={{fontSize:52}}>📭</Text><Text style={s.emptyTxt}>Aucune commande</Text></View>
            :curOrders.map(o=><OrderCard key={o.id} order={o}/>)
          }
          <View style={{height:32}}/>
        </ScrollView>
        <AllModals/>
      </View>
    );
  }

  return <View style={s.container}><StatusBar barStyle="light-content" backgroundColor={NAV}/><AllModals/></View>;
}

const s = StyleSheet.create({
  container:      { flex:1, backgroundColor:BG },
  header:         { backgroundColor:NAV, paddingTop:52, paddingBottom:18, paddingHorizontal:20, overflow:'hidden' },
  decCircle1:     { position:'absolute', top:-40, right:-40, width:180, height:180, backgroundColor:'rgba(255,255,255,0.04)', borderRadius:90 },
  decCircle2:     { position:'absolute', bottom:-60, left:-20, width:140, height:140, backgroundColor:'rgba(246,173,85,0.07)', borderRadius:70 },
  headerRow:      { flexDirection:'row', alignItems:'center', gap:10 },
  backBtn:        { width:42, height:42, backgroundColor:'rgba(255,255,255,0.12)', borderRadius:13, justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.2)' },
  headerTitle:    { fontSize:22, fontWeight:'900', color:'white', letterSpacing:-0.5 },
  headerSub:      { fontSize:12, color:'rgba(255,255,255,0.55)', fontWeight:'600', marginTop:2 },
  pdfBtn:         { backgroundColor:'rgba(255,255,255,0.15)', borderRadius:12, paddingHorizontal:12, paddingVertical:8, flexDirection:'row', alignItems:'center', gap:6, borderWidth:1, borderColor:'rgba(255,255,255,0.25)' },
  pdfBtnTxt:      { color:'white', fontWeight:'900', fontSize:12 },
  pdfActionBtn:   { flex:1, borderRadius:14, paddingVertical:13, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  pdfActionTxt:   { color:'white', fontWeight:'800', fontSize:13 },
  casesGrid:      { flexDirection:'row', flexWrap:'wrap', gap:12, marginBottom:16 },
  caseCard:       { width:'47%', borderRadius:20, padding:18, alignItems:'center', gap:8, borderWidth:1.5 },
  caseCount:      { fontSize:28, fontWeight:'900' },
  caseLabel:      { fontSize:13, fontWeight:'800', textAlign:'center' as any },
  caseArrow:      { width:32, height:32, borderRadius:10, borderWidth:1, justifyContent:'center', alignItems:'center' },
  scroll:         { padding:16 },
  secTitle:       { fontSize:13, fontWeight:'900', color:TEXT2, marginBottom:10, letterSpacing:0.5 },
  statsGrid:      { gap:10, marginBottom:18 },
  statsCol:       { backgroundColor:'white', borderRadius:18, padding:14, borderWidth:1, borderColor:BORDER, shadowColor:NAV, shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:2 },
  statsColHead:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  statsColTitle:  { fontSize:13, fontWeight:'900', color:TEXT },
  statsColTotal:  { fontSize:22, fontWeight:'900', color:NAV },
  statsRow2:      { flexDirection:'row', gap:8 },
  statCard2:      { flex:1, borderRadius:12, padding:8, alignItems:'center', gap:2, borderWidth:1 },
  statEmoji2:     { fontSize:14 },
  statNum2:       { fontSize:16, fontWeight:'900' },
  mainCard:       { backgroundColor:'#fff', borderRadius:22, marginBottom:14, padding:16, flexDirection:'row', alignItems:'center', shadowColor:NAV, shadowOffset:{width:0,height:4}, shadowOpacity:0.1, shadowRadius:12, elevation:4, borderWidth:1, borderColor:BORDER, overflow:'hidden' },
  mainCardLeft:   { flex:1, flexDirection:'row', alignItems:'center', gap:14 },
  mainCardIcon:   { width:64, height:64, borderRadius:18, justifyContent:'center', alignItems:'center' },
  mainCardTitle:  { fontSize:18, fontWeight:'900', color:TEXT, marginBottom:3 },
  mainCardSub:    { fontSize:12, color:TEXT2, fontWeight:'600', marginBottom:3 },
  mainCardArrow:  { width:36, height:36, backgroundColor:'#ede9fe', borderRadius:12, justifyContent:'center', alignItems:'center' },
  listCard:       { backgroundColor:'#fff', borderRadius:20, marginBottom:10, flexDirection:'row', alignItems:'center', gap:12, padding:14, borderWidth:1, borderColor:BORDER, overflow:'hidden', shadowColor:NAV, shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:2 },
  listCardGlow:   { position:'absolute', top:-30, right:-30, width:100, height:100, backgroundColor:'rgba(15,35,86,0.03)', borderRadius:50 },
  listIconBox:    { width:52, height:52, backgroundColor:'#eef2ff', borderRadius:15, justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:'#c7d2fe' },
  listCardTitle:  { fontSize:15, fontWeight:'900', color:TEXT, marginBottom:2 },
  listCardSub:    { fontSize:11, color:TEXT2, fontWeight:'600', marginBottom:2 },
  arrowBox:       { width:32, height:32, backgroundColor:'#eef2ff', borderRadius:10, justifyContent:'center', alignItems:'center' },
  niveauCard:     { backgroundColor:'#fff', borderRadius:18, padding:14, marginBottom:10, flexDirection:'row', alignItems:'center', gap:14, borderWidth:1, borderColor:BORDER, shadowColor:NAV, shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:2 },
  niveauBox:      { backgroundColor:NAV, borderRadius:14, paddingHorizontal:16, paddingVertical:12, minWidth:64, alignItems:'center', shadowColor:NAV, shadowOffset:{width:0,height:4}, shadowOpacity:0.4, shadowRadius:8, elevation:4 },
  niveauTxt:      { fontSize:14, fontWeight:'900', color:'white' },
  niveauMeta:     { fontSize:12, color:TEXT3, fontWeight:'700', marginBottom:2 },
  bulkBtn:        { backgroundColor:'#fff', borderRadius:16, paddingVertical:13, paddingHorizontal:14, flexDirection:'row', alignItems:'center', gap:10, marginBottom:14, borderWidth:1.5, borderColor:'#c7d2fe', shadowColor:NAV, shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:6, elevation:2 },
  bulkIcon:       { width:36, height:36, backgroundColor:'#eef2ff', borderRadius:10, justifyContent:'center', alignItems:'center' },
  bulkTxt:        { flex:1, fontSize:12, fontWeight:'800', color:NAV },
  bulkBadge:      { backgroundColor:NAV, borderRadius:20, paddingHorizontal:10, paddingVertical:4 },
  bulkBadgeTxt:   { fontSize:11, fontWeight:'900', color:'white' },
  statsRow:       { flexDirection:'row', gap:8, marginBottom:14 },
  statCard:       { flex:1, borderRadius:16, padding:11, alignItems:'center', gap:3, borderWidth:1.5 },
  statEmoji:      { fontSize:18 },
  statNum:        { fontSize:20, fontWeight:'900' },
  orderCard:      { backgroundColor:'#fff', borderRadius:18, marginBottom:10, flexDirection:'row', overflow:'hidden', borderWidth:1, borderColor:BORDER, shadowColor:NAV, shadowOffset:{width:0,height:2}, shadowOpacity:0.07, shadowRadius:8, elevation:2 },
  orderStripe:    { width:5 },
  orderTop:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:3 },
  orderName:      { fontSize:14, fontWeight:'900', color:TEXT, flex:1, marginRight:8 },
  orderDate:      { fontSize:10, color:TEXT3, fontWeight:'600', marginBottom:5 },
  orderFoot:      { flexDirection:'row', alignItems:'center', gap:6, flexWrap:'wrap' },
  orderParent:    { fontSize:11, color:TEXT2, fontWeight:'600' },
  orderTag:       { fontSize:10, fontWeight:'800' },
  orderPrice:     { fontSize:14, fontWeight:'900', color:NAV, marginLeft:'auto' as any },
  statusPill:     { borderRadius:20, paddingHorizontal:8, paddingVertical:3, borderWidth:1 },
  statusPillTxt:  { fontSize:10, fontWeight:'900' },
  driverMini:     { backgroundColor:'#eef2ff', borderRadius:20, paddingHorizontal:8, paddingVertical:3, borderWidth:1, borderColor:'#c7d2fe' },
  driverMiniTxt:  { fontSize:10, color:NAV2, fontWeight:'700' },
  empty:          { alignItems:'center', paddingVertical:80, gap:12 },
  emptyTxt:       { fontSize:16, fontWeight:'800', color:TEXT3 },
  overlay:        { flex:1, backgroundColor:'rgba(15,35,86,0.5)', justifyContent:'flex-end' },
  overlayCenter:  { flex:1, backgroundColor:'rgba(15,35,86,0.6)', justifyContent:'center', alignItems:'center', padding:24 },
  sheet:          { backgroundColor:'#fff', borderTopLeftRadius:32, borderTopRightRadius:32, maxHeight:'95%' },
  sheetHandle:    { width:44, height:4, backgroundColor:BORDER, borderRadius:2, alignSelf:'center', marginTop:12 },
  ticketStatus:   { flexDirection:'row', alignItems:'center', gap:10, padding:16, borderBottomWidth:1.5 },
  ticketStatusDot:{ width:10, height:10, borderRadius:5 },
  ticketStatusTxt:{ flex:1, fontSize:15, fontWeight:'900' },
  ticketTypePill: { borderRadius:20, paddingHorizontal:10, paddingVertical:4, borderWidth:1 },
  ticketTypeTxt:  { fontSize:11, fontWeight:'900' },
  prodBanner:     { flexDirection:'row', alignItems:'center', gap:14, padding:16, borderBottomWidth:1, borderBottomColor:BORDER },
  prodIcon:       { width:56, height:56, borderRadius:16, justifyContent:'center', alignItems:'center' },
  prodName:       { fontSize:16, fontWeight:'900', color:TEXT, marginBottom:3 },
  prodMeta:       { fontSize:12, color:TEXT2, fontWeight:'600' },
  prodDate:       { fontSize:10, color:TEXT3, fontWeight:'600', textAlign:'right' as any },
  ticketBody:     { padding:18 },
  infoCard:       { backgroundColor:'#f9fafb', borderRadius:16, padding:14, marginBottom:12, borderWidth:1, borderColor:BORDER },
  infoCardHead:   { flexDirection:'row', alignItems:'center', gap:8, marginBottom:10 },
  infoDot:        { width:8, height:8, borderRadius:4 },
  infoCardLbl:    { fontSize:10, fontWeight:'900', color:TEXT3, letterSpacing:1.5 },
  infoName:       { fontSize:15, fontWeight:'900', color:TEXT, marginBottom:5 },
  infoSub:        { fontSize:12, color:TEXT2, marginTop:3, fontWeight:'600' },
  contactBtns:    { flexDirection:'row', gap:8, marginTop:12 },
  callBtn:        { flex:1, backgroundColor:GREEN, borderRadius:12, paddingVertical:10, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:7 },
  callBtnTxt:     { color:'white', fontWeight:'900', fontSize:12 },
  quickBtns:      { flexDirection:'row', gap:10, marginBottom:12 },
  qBtnMap:        { flex:1, backgroundColor:RED, borderRadius:14, paddingVertical:12, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:7 },
  qBtnPDF:        { flex:1, backgroundColor:'#1d4ed8', borderRadius:14, paddingVertical:12, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:7 },
  qBtnTxt:        { color:'white', fontWeight:'900', fontSize:13 },
  articleRow:     { flexDirection:'row', alignItems:'center', paddingVertical:9, gap:8 },
  articleImg:     { width:40, height:40, borderRadius:8, backgroundColor:'#f3f4f6' },
  articleName:    { flex:1, fontSize:13, color:TEXT, fontWeight:'700' },
  articleRight:   { flexDirection:'row', alignItems:'center', gap:8 },
  articleQty:     { backgroundColor:'#ede9fe', borderRadius:8, paddingHorizontal:7, paddingVertical:2 },
  articleQtyTxt:  { fontSize:12, color:PURPLE, fontWeight:'900' },
  articlePrice:   { fontSize:13, fontWeight:'900', color:NAV, minWidth:72, textAlign:'right' as any },
  totalBar:       { flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:NAV, borderRadius:14, padding:16, marginBottom:12, shadowColor:NAV, shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:8, elevation:4 },
  totalLbl:       { fontSize:12, fontWeight:'900', color:'rgba(255,255,255,0.7)', letterSpacing:1 },
  totalAmt:       { fontSize:22, fontWeight:'900', color:'white' },
  observeNote:    { flexDirection:'row', alignItems:'flex-start', gap:10, backgroundColor:'#eff6ff', borderRadius:14, padding:14, marginBottom:12, borderWidth:1, borderColor:'#bfdbfe' },
  observeNoteTxt: { flex:1, fontSize:12, color:'#1d4ed8', fontWeight:'600', lineHeight:18 },
  livreedNote:    { flexDirection:'row', alignItems:'flex-start', gap:10, backgroundColor:'#dcfce7', borderRadius:14, padding:14, marginBottom:12, borderWidth:1, borderColor:'#86efac' },
  livreedTxt:     { flex:1, fontSize:12, color:GREEN, fontWeight:'700', lineHeight:18 },
  driverBanner:   { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#eef2ff', borderRadius:14, padding:14, marginBottom:12, borderWidth:1, borderColor:'#c7d2fe' },
  driverBannerName:{ fontSize:14, fontWeight:'900', color:NAV },
  driverBannerSub: { fontSize:11, color:TEXT2, fontWeight:'600' },
  actionsBox:     { gap:10, marginBottom:10, marginTop:4 },
  btnNavy:        { backgroundColor:NAV, borderRadius:16, paddingVertical:15, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, shadowColor:NAV, shadowOffset:{width:0,height:6}, shadowOpacity:0.35, shadowRadius:10, elevation:5 },
  btnGreen:       { backgroundColor:GREEN, borderRadius:16, paddingVertical:15, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10 },
  btnBlue:        { backgroundColor:BLUE, borderRadius:16, paddingVertical:15, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, shadowColor:BLUE, shadowOffset:{width:0,height:4}, shadowOpacity:0.35, shadowRadius:8, elevation:4 },
  btnGray:        { backgroundColor:'#f3f4f6', borderRadius:16, paddingVertical:14, flexDirection:'row', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:BORDER },
  btnGrayTxt:     { color:TEXT2, fontWeight:'800', fontSize:14 },
  btnTxt:         { color:'white', fontWeight:'900', fontSize:15 },
  btnRed:         { backgroundColor:'#fff1f2', borderRadius:16, paddingVertical:13, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, borderWidth:1.5, borderColor:'#fecdd3' },
  btnRedTxt:      { color:RED, fontWeight:'800', fontSize:14 },
  btnClose:       { backgroundColor:'#f3f4f6', borderRadius:16, paddingVertical:14, alignItems:'center', marginTop:8, borderWidth:1, borderColor:BORDER },
  btnCloseTxt:    { color:TEXT2, fontWeight:'800', fontSize:14 },
  driverModalHead:{ flexDirection:'row', alignItems:'center', gap:10, paddingHorizontal:20, marginBottom:14, marginTop:8 },
  driverModalTitle:{ fontSize:18, fontWeight:'900', color:TEXT, flex:1 },
  noDriver:       { backgroundColor:'#fefce8', borderRadius:14, padding:16, marginHorizontal:20, marginBottom:14, borderWidth:1, borderColor:'#fde68a' },
  noDriverTxt:    { fontSize:13, color:'#92400e', fontWeight:'700' },
  driverItem:     { flexDirection:'row', alignItems:'center', gap:14, padding:14, backgroundColor:'#f9fafb', borderRadius:16, marginBottom:10, borderWidth:1, borderColor:BORDER },
  driverAvatar:   { width:46, height:46, borderRadius:14, backgroundColor:NAV, justifyContent:'center', alignItems:'center' },
  driverAvatarTxt:{ fontSize:19, fontWeight:'900', color:'white' },
  driverName:     { fontSize:15, fontWeight:'900', color:TEXT },
  driverRole:     { fontSize:11, color:TEXT3, fontWeight:'600', marginTop:1 },
  confirmBox:     { backgroundColor:'white', borderRadius:24, padding:24, width:'100%', alignItems:'center', shadowColor:NAV, shadowOffset:{width:0,height:8}, shadowOpacity:0.2, shadowRadius:20, elevation:10 },
  confirmIcon:    { width:72, height:72, backgroundColor:'#ffedd5', borderRadius:22, justifyContent:'center', alignItems:'center', marginBottom:14 },
  confirmTitle:   { fontSize:18, fontWeight:'900', color:TEXT, marginBottom:6, textAlign:'center' as any },
  confirmSub:     { fontSize:13, color:TEXT2, fontWeight:'600', textAlign:'center' as any },
  recuCard:       { backgroundColor:'white', borderRadius:20, overflow:'hidden', shadowColor:NAV, shadowOffset:{width:0,height:8}, shadowOpacity:0.15, shadowRadius:20, elevation:8 },
  recuHeader:     { backgroundColor:NAV, padding:20, overflow:'hidden', position:'relative' },
  recuLogoRow:    { flexDirection:'row', alignItems:'center', gap:12, marginBottom:12 },
  recuLogoBox:    { width:46, height:46, backgroundColor:'white', borderRadius:13, justifyContent:'center', alignItems:'center' },
  recuLogoTxt:    { fontSize:17, fontWeight:'900', color:NAV },
  recuBrand:      { fontSize:20, fontWeight:'900', color:'white', letterSpacing:-0.5 },
  recuBrandSub:   { fontSize:10, color:'rgba(255,255,255,0.6)', fontWeight:'700', letterSpacing:2 },
  recuRef:        { fontSize:11, color:'rgba(255,255,255,0.55)', fontWeight:'600' },
  recuDate:       { fontSize:11, color:'rgba(255,255,255,0.55)', fontWeight:'600', marginTop:2 },
  recuSection:    { backgroundColor:'#f9fafb', borderRadius:14, padding:13, marginBottom:10, borderWidth:1, borderColor:BORDER },
});