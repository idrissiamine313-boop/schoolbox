 import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';
import { supabase } from '../../lib/supabase';

const NAV = '#0f2356';

// --- ICONS ---
function IconBack({ size = 20, color = 'white' }) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconPDF({ size = 20, color = NAV }) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="14 2 14 8 20 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Line x1="16" y1="13" x2="8" y2="13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Line x1="16" y1="17" x2="8" y2="17" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="10 9 9 9 8 9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconUser({ size = 18, color = '#718096' }) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }

export default function AdminRapports() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const [parents, setParents] = useState<any[]>([]); 
  const [allLivreurs, setAllLivreurs] = useState<any[]>([]); 
  
  const [view, setView] = useState<'LIST' | 'PARENT_DETAIL' | 'LIVREUR_DETAIL'>('LIST');
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [selectedLivreur, setSelectedLivreur] = useState<any>(null);
  
  // زدنا الداتا المفصلة باش نصيفطوها للـ PDF
  const [detailedOrders, setDetailedOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, livrees: 0, annulees: 0, encours: 0, total_revenu: 0 });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data: pData } = await supabase.from('app_users').select('*, library:libraries(name)').in('role', ['admin', 'libraire']).order('role', { ascending: true });
    const { data: lData } = await supabase.from('app_users').select('*').eq('role', 'livreur');
    
    setParents(pData || []);
    setAllLivreurs(lData || []);
    setLoading(false);
  }

  // الكويري لي كتجيب تفاصيل التفاصيل (الكوموند + التلميذ + المدرسة + السلعة)
  const orderSelectQuery = `
    id, status, total_price, created_at,
    student:students(full_name),
    school:schools(name),
    items:order_items(item_name, quantity, item_price)
  `;

  async function openParentDetail(parent: any) {
    setSelectedParent(parent);
    setView('PARENT_DETAIL');
    setStatsLoading(true);
    
    try {
      let query = supabase.from('orders').select(orderSelectQuery);
      
      if (parent.role === 'libraire' && parent.library_id) {
        const { data: libSchools } = await supabase.from('library_schools').select('school_id').eq('library_id', parent.library_id);
        if (libSchools && libSchools.length > 0) {
          const schoolIds = libSchools.map(s => s.school_id);
          query = query.in('school_id', schoolIds);
        } else {
          setDetailedOrders([]);
          calculerStats([]); 
          setStatsLoading(false);
          return;
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setDetailedOrders(data || []);
      calculerStats(data || []);
    } catch (err) {
      console.log("Erreur Data:", err);
    } finally {
      setStatsLoading(false);
    }
  }

  async function openLivreurDetail(livreur: any) {
    setSelectedLivreur(livreur);
    setView('LIVREUR_DETAIL');
    setStatsLoading(true);
    
    try {
      const { data, error } = await supabase.from('orders').select(orderSelectQuery).eq('driver_id', livreur.id);
      if (error) throw error;
      
      setDetailedOrders(data || []);
      calculerStats(data || []);
    } catch (err) {
      console.log("Erreur Data Livreur:", err);
    } finally {
      setStatsLoading(false);
    }
  }

  function calculerStats(commandesData: any[]) {
      let livrees = 0, annulees = 0, encours = 0, total_revenu = 0;
      commandesData.forEach(cmd => {
        const status = (cmd.status || '').toString().toLowerCase().trim();
        if (['livree', 'livré', 'delivered', 'livrée'].includes(status)) {
            livrees++;
            total_revenu += Number(cmd.total_price || 0); 
        }
        else if (['annulee', 'annulé', 'cancelled', 'retour', 'retourné'].includes(status)) annulees++;
        else encours++; 
      });
      setStats({ total: commandesData.length, livrees, annulees, encours, total_revenu });
  }

  function goBack() {
    if (view === 'LIVREUR_DETAIL') setView('PARENT_DETAIL');
    else if (view === 'PARENT_DETAIL') setView('LIST');
    else router.back();
  }

  // ===================== GENERATION PDF (DESIGN WA3ER) =====================
  const generateAndSharePDF = async (user: any, title: string) => {
    try {
      setIsGeneratingPDF(true);
      const dateAujourdhui = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' });
      
      // صناعة صفوف الجدول من الداتا
      const tableRows = detailedOrders.map((cmd, index) => {
        const studentName = cmd.student?.full_name || 'Non spécifié';
        const schoolName = cmd.school?.name || 'Non spécifiée';
        const dateCmd = new Date(cmd.created_at).toLocaleDateString('fr-FR');
        const price = Number(cmd.total_price || 0).toFixed(2) + ' DH';
        
        // جيب كاع السلعة لي فهاد الكوموند و دير بيناتهم سطر
        const itemsList = cmd.items && cmd.items.length > 0 
          ? cmd.items.map((i: any) => `• ${i.quantity}x ${i.item_name}`).join('<br/>') 
          : '-';

        // ديزاين ديال حالة الطلب (Badge)
        let statusBadge = '';
        const stat = (cmd.status || '').toLowerCase();
        if (['livree', 'livré', 'delivered'].includes(stat)) statusBadge = `<span class="badge badge-success">Livrée</span>`;
        else if (['annulee', 'annulé', 'retour'].includes(stat)) statusBadge = `<span class="badge badge-danger">Annulée</span>`;
        else statusBadge = `<span class="badge badge-warning">En cours</span>`;

        return `
          <tr>
            <td>${index + 1}</td>
            <td>${dateCmd}</td>
            <td>
              <strong>${studentName}</strong><br/>
              <span style="font-size:10px; color:#64748b;">🏫 ${schoolName}</span>
            </td>
            <td style="font-size:11px; line-height:1.4;">${itemsList}</td>
            <td><strong>${price}</strong></td>
            <td>${statusBadge}</td>
          </tr>
        `;
      }).join('');

      // الكود ديال الـ HTML (ديزاين هربان)
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&family=Inter:wght@400;600;800&display=swap');
              
              body { 
                font-family: 'Inter', 'Cairo', sans-serif; 
                color: #1e293b; 
                padding: 40px; 
                background-color: #fff;
              }
              
              /* HEADER & LOGO */
              .header { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                border-bottom: 3px solid #0f2356; 
                padding-bottom: 20px; 
                margin-bottom: 30px; 
              }
              .logo-container {
                display: flex;
                align-items: center;
                gap: 10px;
              }
              .logo-box {
                background: linear-gradient(135deg, #0f2356, #1e3a8a);
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                font-weight: 900;
                font-size: 24px;
                letter-spacing: 1px;
              }
              .logo-text { font-size: 20px; font-weight: 800; color: #0f2356; }
              
              .report-title { text-align: right; }
              .title { font-size: 26px; color: #0f2356; font-weight: 800; margin: 0; text-transform: uppercase; }
              .date { font-size: 13px; color: #64748b; margin-top: 5px; }

              /* USER INFO */
              .user-card {
                background-color: #f8fafc;
                border-left: 5px solid #0f2356;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
              }
              .info-group h4 { margin: 0 0 5px 0; font-size: 12px; color: #64748b; text-transform: uppercase; }
              .info-group p { margin: 0; font-size: 16px; font-weight: 700; color: #0f2356; }

              /* STATS DASHBOARD */
              .stats-row { display: flex; gap: 15px; margin-bottom: 30px; }
              .stat-box {
                flex: 1; padding: 20px; border-radius: 12px; text-align: center;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
              }
              .bg-blue { background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; }
              .bg-green { background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
              .bg-red { background-color: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
              .bg-teal { background-color: #f0fdfa; border: 1px solid #a7f3d0; color: #0f766e; }
              
              .stat-num { font-size: 28px; font-weight: 900; margin-bottom: 5px; }
              .stat-lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

              /* TABLE DESIGN */
              .section-title { font-size: 18px; color: #0f2356; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px; }
              th { background-color: #0f2356; color: white; padding: 12px 10px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;}
              td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
              tr:nth-child(even) { background-color: #f8fafc; }
              
              /* BADGES */
              .badge { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
              .badge-success { background-color: #dcfce7; color: #166534; }
              .badge-danger { background-color: #fee2e2; color: #991b1b; }
              .badge-warning { background-color: #fef9c3; color: #854d0e; }

              /* FOOTER */
              .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; page-break-inside: avoid; }
              
              /* PRINT RULES */
              @media print {
                tr { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            
            <div class="header">
              <div class="logo-container">
                <!-- إيلا عندك ليا ديال لوغو حقيقي، حيد هاد div و حط: <img src="URL_DYAL_LOGO" width="120" /> -->
                <div class="logo-box">S</div>
                <div class="logo-text">SchoolBox</div>
              </div>
              <div class="report-title">
                <h1 class="title">${title}</h1>
                <div class="date">Généré le: ${dateAujourdhui}</div>
              </div>
            </div>
            
            <div class="user-card">
              <div class="info-group">
                <h4>Nom Complet</h4>
                <p>${user?.full_name || 'N/A'}</p>
              </div>
              <div class="info-group">
                <h4>Rôle</h4>
                <p>${user?.role?.toUpperCase() || 'N/A'}</p>
              </div>
              <div class="info-group">
                <h4>Total Commandes</h4>
                <p>${stats.total}</p>
              </div>
            </div>

            <div class="stats-row">
              <div class="stat-box bg-blue">
                <div class="stat-num">${stats.total}</div>
                <div class="stat-lbl">Affectées</div>
              </div>
              <div class="stat-box bg-green">
                <div class="stat-num">${stats.livrees}</div>
                <div class="stat-lbl">Livrées</div>
              </div>
              <div class="stat-box bg-red">
                <div class="stat-num">${stats.annulees}</div>
                <div class="stat-lbl">Annulées</div>
              </div>
              <div class="stat-box bg-teal">
                <div class="stat-num">${stats.total_revenu.toFixed(2)} DH</div>
                <div class="stat-lbl">Revenu Récolté</div>
              </div>
            </div>

            <h2 class="section-title">📋 Détails des Commandes</h2>
            
            <table>
              <thead>
                <tr>
                  <th width="5%">#</th>
                  <th width="15%">Date</th>
                  <th width="25%">Élève & École</th>
                  <th width="30%">Articles Requis</th>
                  <th width="12%">Total</th>
                  <th width="13%">Statut</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows.length > 0 ? tableRows : '<tr><td colspan="6" style="text-align:center; padding:30px; color:#94a3b8;">Aucune commande trouvée.</td></tr>'}
              </tbody>
            </table>

            <div class="footer">
              Ce document est certifié et généré automatiquement par le système central SchoolBox.<br/>
              © ${new Date().getFullYear()} SchoolBox App - Tous droits réservés.
            </div>

          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        Alert.alert('تنبيه', 'خاصية المشاركة ماخدااماش فهاد التيلفون.');
      }

    } catch (error: any) {
      console.error("إيرور فالـ PDF:", error);
      Alert.alert('مشكل فالـ PDF', 'ماقدرناش نصاوبو البي دي إف. تأكد من البيانات.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };


  // ===================== INTERFACE =====================
  
  const attachedLivreurs = allLivreurs.filter(liv => {
    if (!selectedParent) return false;
    if (selectedParent.role === 'admin') return liv.linked_admin_id === selectedParent.id;
    if (selectedParent.role === 'libraire') return liv.library_ids?.includes(selectedParent.library_id) || liv.library_id === selectedParent.library_id;
    return false;
  });

  const renderList = () => (
    <ScrollView contentContainerStyle={s.scroll}>
      <Text style={s.sectionTitle}>Admins & Libraires</Text>
      <Text style={s.sectionSub}>Sélectionnez un profil pour voir le rapport détaillé</Text>
      
      {parents.map(user => (
        <TouchableOpacity key={user.id} style={s.userCard} onPress={() => openParentDetail(user)}>
          <View style={[s.avatar, { backgroundColor: user.role === 'admin' ? NAV : '#7c3aed' }]}><IconUser color="white" size={24} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.userName}>{user.full_name}</Text>
            <Text style={s.userRole}>{user.role === 'admin' ? 'Super Admin' : `Libraire • ${user.library?.name || ''}`}</Text>
          </View>
          <IconPDF size={24} color="#9ca3af" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderRapportPaper = (title: string, user: any) => (
    <View style={s.paper}>
      <View style={s.paperHeader}>
        <View>
          <Text style={s.paperTitle}>RAPPORT D'ACTIVITÉ</Text>
          <Text style={s.paperDate}>{new Date().toLocaleDateString('fr-FR')}</Text>
        </View>
        <IconPDF size={30} color={NAV} />
      </View>
      
      <View style={s.paperUserInfo}>
        <Text style={s.infoLabel}>Nom complet : <Text style={s.infoVal}>{user?.full_name}</Text></Text>
        <Text style={s.infoLabel}>Rôle : <Text style={s.infoVal}>{user?.role?.toUpperCase()}</Text></Text>
      </View>

      <View style={s.divider} />

      {statsLoading ? (
        <ActivityIndicator size="large" color={NAV} style={{marginVertical: 40}} />
      ) : (
        <>
          <Text style={s.tableTitle}>Bilan des Commandes</Text>
          <View style={s.statsGrid}>
            <View style={[s.statBox, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
              <Text style={[s.statNum, { color: '#1d4ed8' }]}>{stats.total}</Text>
              <Text style={s.statLbl}>Total</Text>
            </View>
            <View style={[s.statBox, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
              <Text style={[s.statNum, { color: '#15803d' }]}>{stats.livrees}</Text>
              <Text style={s.statLbl}>Livrées</Text>
            </View>
            <View style={[s.statBox, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
              <Text style={[s.statNum, { color: '#b91c1c' }]}>{stats.annulees}</Text>
              <Text style={s.statLbl}>Annulées</Text>
            </View>
            <View style={[s.statBox, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
              <Text style={[s.statNum, { color: '#b45309' }]}>{stats.encours}</Text>
              <Text style={s.statLbl}>En Cours</Text>
            </View>
          </View>

          <View style={[s.statBox, { backgroundColor: '#f0fdfa', borderColor: '#a7f3d0', width: '100%', marginBottom: 20 }]}>
              <Text style={[s.statNum, { color: '#0f766e', fontSize: 28 }]}>{stats.total_revenu.toFixed(2)} DH</Text>
              <Text style={s.statLbl}>Total Argent Récolté</Text>
          </View>

          <TouchableOpacity 
            style={[s.btnDownload, isGeneratingPDF && {opacity: 0.7}]} 
            onPress={() => generateAndSharePDF(user, title)}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? <ActivityIndicator color="white" size="small" /> : <IconPDF color="white" size={18} />}
            <Text style={s.btnDownloadTxt}>{isGeneratingPDF ? "Génération en cours..." : "Télécharger PDF"}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={NAV} />
      
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={goBack}><IconBack /></TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>{view === 'LIST' ? 'Rapports & Stats' : view === 'PARENT_DETAIL' ? selectedParent?.full_name : selectedLivreur?.full_name}</Text>
          <Text style={s.headerSub}>{view === 'LIST' ? 'Gestion des performances' : 'Détails du rapport'}</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.loader}><ActivityIndicator size="large" color={NAV} /></View>
      ) : (
        <>
          {view === 'LIST' && renderList()}
          {view === 'PARENT_DETAIL' && (
            <ScrollView contentContainerStyle={s.scroll}>
              {renderRapportPaper('Rapport Global', selectedParent)}
              <Text style={[s.sectionTitle, { marginTop: 24 }]}>Équipe de Livraison</Text>
              {attachedLivreurs.length === 0 ? (
                <View style={s.emptyBox}><Text style={s.emptyBoxTxt}>Aucun livreur attaché.</Text></View>
              ) : (
                attachedLivreurs.map(liv => (
                  <TouchableOpacity key={liv.id} style={s.userCard} onPress={() => openLivreurDetail(liv)}>
                    <View style={[s.avatar, { backgroundColor: '#0369a1' }]}><IconUser color="white" size={24} /></View>
                    <View style={{ flex: 1 }}><Text style={s.userName}>{liv.full_name}</Text><Text style={s.userRole}>Livreur</Text></View>
                    <IconPDF size={24} color="#0369a1" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
          {view === 'LIVREUR_DETAIL' && (
            <ScrollView contentContainerStyle={s.scroll}>
              {renderRapportPaper('Rapport de Livraison', selectedLivreur)}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { backgroundColor: NAV, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: NAV, marginBottom: 4 },
  sectionSub: { fontSize: 13, color: '#64748b', marginBottom: 16, fontWeight: '500' },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 14, borderRadius: 16, marginBottom: 10, shadowColor: NAV, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  avatar: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userName: { fontSize: 16, fontWeight: '800', color: NAV },
  userRole: { fontSize: 13, color: '#64748b', fontWeight: '600', marginTop: 2 },
  paper: { backgroundColor: 'white', borderRadius: 8, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 8, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  paperHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  paperTitle: { fontSize: 22, fontWeight: '900', color: NAV, letterSpacing: 0.5 },
  paperDate: { fontSize: 13, color: '#64748b', fontWeight: '600', marginTop: 4 },
  paperUserInfo: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  infoLabel: { fontSize: 12, color: '#64748b', fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  infoVal: { fontSize: 14, color: NAV, fontWeight: '800', textTransform: 'none' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#e2e8f0' },
  tableTitle: { fontSize: 15, fontWeight: '800', color: NAV, marginBottom: 12, textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, minWidth: '45%', padding: 16, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  statLbl: { fontSize: 11, fontWeight: '700', color: '#475569', textTransform: 'uppercase', textAlign: 'center' },
  btnDownload: { backgroundColor: NAV, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 10 },
  btnDownloadTxt: { color: 'white', fontWeight: '800', fontSize: 15 },
  emptyBox: { padding: 20, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 12 },
  emptyBoxTxt: { color: '#64748b', fontWeight: '600' }
});