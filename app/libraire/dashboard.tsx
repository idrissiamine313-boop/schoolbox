import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const NAV = '#0f2356';
const RED = '#e53e3e';
const PURPLE = '#7c3aed';

function IconLogout({ size = 20, color = 'white' }: any) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="16 17 21 12 16 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconOrder({ size = 20, color = 'white' }: any) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="14 2 14 8 20 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Line x1="16" y1="13" x2="8" y2="13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Line x1="16" y1="17" x2="8" y2="17" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="10 9 9 9 8 9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconFilter({ size = 18, color = 'white' }: any) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconTruck({ size = 16, color = NAV }: any) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="1" y="3" width="15" height="13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M16 8h4l3 3v5h-7V8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="5.5" cy="18.5" r="2.5" stroke={color} strokeWidth={2} /><Circle cx="18.5" cy="18.5" r="2.5" stroke={color} strokeWidth={2} /></Svg>;
}
function IconCheck({ size = 16, color = 'white' }: any) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="20 6 9 17 4 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconCancel({ size = 16, color = RED }: any) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} /><Line x1="15" y1="9" x2="9" y2="15" stroke={color} strokeWidth={2} strokeLinecap="round" /><Line x1="9" y1="9" x2="15" y2="15" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>;
}
function IconPhone({ size = 13, color = '#718096' }: any) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.22 2.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconSchool({ size = 13, color = '#718096' }: any) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="9 22 9 12 15 12 15 22" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}

const STATUS_CONFIG: any = {
  en_preparation: { label: 'En préparation', color: '#d97706', bg: '#fef3c7' },
  en_attente:     { label: 'En attente livreur', color: '#0369a1', bg: '#e0f2fe' },
  annulee:        { label: 'Annulée', color: RED, bg: '#fef2f2' },
  livree:         { label: 'Livrée', color: '#16a34a', bg: '#dcfce7' },
};

export default function LibraireDashboard() {
  const { appUser, signOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string>('en_preparation');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showTicket, setShowTicket] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [filterSchool, setFilterSchool] = useState('');
  const [filterNiveau, setFilterNiveau] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setRefreshing(true);
    if (!appUser?.library_id) {
      console.log('NO LIBRARY ID', appUser);
      setRefreshing(false);
      return;
    }

    console.log('library_id:', appUser.library_id);

    const { data: libSchools, error: e1 } = await supabase
      .from('library_schools')
      .select('school_id')
      .eq('library_id', appUser.library_id);

    console.log('libSchools:', libSchools, 'error:', e1);

    const schoolIds = libSchools?.map((s: any) => s.school_id) || [];

    if (schoolIds.length === 0) {
      console.log('NO SCHOOLS');
      setRefreshing(false);
      return;
    }

    const { data: schoolStudents, error: e2 } = await supabase
      .from('students')
      .select('id')
      .in('school_id', schoolIds);

    console.log('students count:', schoolStudents?.length, 'error:', e2);

    const studentIds = schoolStudents?.map((s: any) => s.id) || [];

    if (studentIds.length === 0) {
      console.log('NO STUDENTS');
      setRefreshing(false);
      return;
    }

    const { data: ordersData, error: e3 } = await supabase
      .from('orders')
      .select(`
        *,
        student:students(
          full_name,
          school:schools(name, abbreviation),
          level:levels(name),
          class:classes(name)
        ),
        parent_code:parent_codes(parent_name, parent_phone),
        driver:app_users(full_name),
        items:order_items(item_name, item_price, quantity, unit_price)
      `)
      .in('student_id', studentIds)
      .eq('type', 'fourniture')
      .order('created_at', { ascending: false });

    console.log('orders count:', ordersData?.length, 'error:', e3);

    setOrders(ordersData || []);

    const { data: driversData } = await supabase
      .from('app_users')
      .select('id, full_name')
      .eq('role', 'livreur')
      .eq('library_id', appUser.library_id)
      .eq('is_active', true);

    setDrivers(driversData || []);
    setRefreshing(false);
  }

  async function updateStatus(orderId: string, newStatus: string) {
    setLoadingAction(true);
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    await loadData();
    setShowTicket(false);
    setLoadingAction(false);
  }

  async function assignDriver(orderId: string, driverId: string) {
    setLoadingAction(true);
    await supabase.from('orders').update({
      driver_id: driverId,
      status: 'en_attente',
    }).eq('id', orderId);
    await loadData();
    setShowDriverModal(false);
    setShowTicket(false);
    setLoadingAction(false);
  }

  async function cancelOrder(orderId: string) {
    Alert.alert('Annuler', 'Annuler cette commande ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui', style: 'destructive', onPress: async () => { await updateStatus(orderId, 'annulee'); } },
    ]);
  }

  const filteredOrders = orders.filter(o => {
    if (o.status !== activeStatus) return false;
    if (filterSchool && o.student?.school?.name !== filterSchool) return false;
    if (filterNiveau && o.student?.level?.name !== filterNiveau) return false;
    return true;
  });

  const counts = {
    en_preparation: orders.filter(o => o.status === 'en_preparation').length,
    en_attente: orders.filter(o => o.status === 'en_attente').length,
    livree: orders.filter(o => o.status === 'livree').length,
    annulee: orders.filter(o => o.status === 'annulee').length,
  };

  const allNiveaux = [...new Set(orders.map(o => o.student?.level?.name).filter(Boolean))];
  const allSchools = [...new Set(orders.map(o => o.student?.school?.name).filter(Boolean))];

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={PURPLE} />

      <View style={s.header}>
        <View style={s.dec1} /><View style={s.dec2} />
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <View style={s.avatarBox}>
              <Text style={s.avatarTxt}>{(appUser?.full_name || 'L')[0].toUpperCase()}</Text>
            </View>
            <View>
              <Text style={s.headerTitle}>{appUser?.full_name || 'Libraire'}</Text>
              <Text style={s.headerSub}>Espace Libraire</Text>
            </View>
          </View>
          <View style={s.headerActions}>
            <TouchableOpacity style={s.filterBtn} onPress={() => setShowFilterModal(true)}>
              <IconFilter size={16} />
              {(filterSchool || filterNiveau) && <View style={s.filterDot} />}
            </TouchableOpacity>
            <TouchableOpacity style={s.logoutBtn} onPress={() => {
              Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Oui', style: 'destructive', onPress: signOut },
              ]);
            }}>
              <IconLogout size={18} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.statsRow}>
          {Object.keys(STATUS_CONFIG).map(status => (
            <View key={status} style={s.statBox}>
              <Text style={s.statNum}>{counts[status as keyof typeof counts]}</Text>
              <Text style={s.statLbl}>{STATUS_CONFIG[status].label.split(' ')[0]}</Text>
            </View>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={s.tabs}>
            {Object.keys(STATUS_CONFIG).map(status => {
              const active = activeStatus === status;
              const cfg = STATUS_CONFIG[status];
              return (
                <TouchableOpacity key={status} style={[s.tab, active && { backgroundColor: cfg.color }]} onPress={() => setActiveStatus(status)}>
                  <Text style={[s.tabTxt, active && { color: 'white' }]}>{cfg.label}</Text>
                  {counts[status as keyof typeof counts] > 0 && (
                    <View style={[s.tabBadge, active && { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                      <Text style={[s.tabBadgeTxt, active && { color: 'white' }]}>{counts[status as keyof typeof counts]}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={PURPLE} />} showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View style={s.empty}>
            <View style={s.emptyIcon}><IconOrder size={40} color={PURPLE} /></View>
            <Text style={s.emptyTxt}>Aucune commande</Text>
          </View>
        ) : filteredOrders.map(order => (
          <TouchableOpacity key={order.id} style={s.card} onPress={() => { setSelectedOrder(order); setShowTicket(true); }}>
            <View style={s.cardTop}>
              <View>
                <Text style={s.orderNum}>Commande</Text>
                <Text style={s.orderDate}>{formatDate(order.created_at)}</Text>
              </View>
              <View style={[s.statusBadge, { backgroundColor: STATUS_CONFIG[order.status]?.bg }]}>
                <Text style={[s.statusTxt, { color: STATUS_CONFIG[order.status]?.color }]}>{STATUS_CONFIG[order.status]?.label}</Text>
              </View>
            </View>

            <View style={s.cardMid}>
              <Text style={s.studentName}>{order.student?.full_name}</Text>
              <View style={s.detailRow}>
                <IconSchool size={12} color="#9ca3af" />
                <Text style={s.detailTxt}>{order.student?.school?.abbreviation} • {order.student?.level?.name}{order.student?.class?.name ? ` ${order.student.class.name}` : ''}</Text>
              </View>
              <View style={s.detailRow}>
                <IconPhone size={12} color="#9ca3af" />
                <Text style={s.detailTxt}>{order.parent_code?.parent_name} — {order.parent_code?.parent_phone}</Text>
              </View>
            </View>

            <View style={s.cardBottom}>
              <Text style={s.itemsCount}>{order.items?.length || 0} article(s)</Text>
              <Text style={s.total}>{Number(order.total_price).toFixed(2)} MAD</Text>
            </View>

            {order.driver && (
              <View style={s.driverRow}>
                <IconTruck size={12} color={PURPLE} />
                <Text style={s.driverTxt}>Livreur: {order.driver.full_name}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Ticket Modal */}
      <Modal visible={showTicket} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.handle} />
            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={s.ticketHeader}>
                  <View>
                    <Text style={s.ticketNum}>Détails commande</Text>
                    <Text style={s.ticketDate}>{formatDate(selectedOrder.created_at)}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: STATUS_CONFIG[selectedOrder.status]?.bg }]}>
                    <Text style={[s.statusTxt, { color: STATUS_CONFIG[selectedOrder.status]?.color }]}>{STATUS_CONFIG[selectedOrder.status]?.label}</Text>
                  </View>
                </View>

                <View style={s.divider} />

                <Text style={s.sectionTitle}>👤 ÉLÈVE</Text>
                <View style={s.infoBox}>
                  <Text style={s.infoName}>{selectedOrder.student?.full_name}</Text>
                  <Text style={s.infoSub}>{selectedOrder.student?.school?.name}</Text>
                  <Text style={s.infoSub}>{selectedOrder.student?.level?.name}{selectedOrder.student?.class?.name ? ` — ${selectedOrder.student.class.name}` : ''}</Text>
                </View>

                <Text style={s.sectionTitle}>👨‍👩‍👦 PARENT</Text>
                <View style={s.infoBox}>
                  <Text style={s.infoName}>{selectedOrder.parent_code?.parent_name}</Text>
                  <Text style={s.infoSub}>📞 {selectedOrder.parent_code?.parent_phone}</Text>
                  {selectedOrder.address ? <Text style={s.infoSub}>📍 {selectedOrder.address}</Text> : null}
                </View>

                <Text style={s.sectionTitle}>📦 ARTICLES</Text>
                <View style={s.productsBox}>
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <View key={i} style={s.productRow}>
                      <Text style={s.productName}>{item.item_name}</Text>
                      <View style={s.productRight}>
                        <Text style={s.productQty}>x{item.quantity}</Text>
                        <Text style={s.productPrice}>{Number(item.unit_price * item.quantity).toFixed(2)} MAD</Text>
                      </View>
                    </View>
                  ))}
                  {selectedOrder.wrapping && (
                    <View style={s.productRow}>
                      <Text style={[s.productName, { color: '#d97706' }]}>🛡️ Protection cahiers</Text>
                    </View>
                  )}
                  <View style={s.totalRow}>
                    <Text style={s.totalLabel}>TOTAL</Text>
                    <Text style={s.totalAmount}>{Number(selectedOrder.total_price).toFixed(2)} MAD</Text>
                  </View>
                </View>

                {selectedOrder.driver && (
                  <>
                    <Text style={s.sectionTitle}>🚚 LIVREUR</Text>
                    <View style={s.infoBox}>
                      <Text style={s.infoName}>{selectedOrder.driver.full_name}</Text>
                    </View>
                  </>
                )}

                <View style={s.divider} />

                {selectedOrder.status === 'en_preparation' && (
                  <View style={s.actionsBox}>
                    <TouchableOpacity style={s.assignBtn} onPress={() => setShowDriverModal(true)} disabled={loadingAction}>
                      <IconTruck size={18} color="white" />
                      <Text style={s.assignBtnTxt}>Assigner un livreur</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.cancelBtn} onPress={() => cancelOrder(selectedOrder.id)} disabled={loadingAction}>
                      <IconCancel size={16} color={RED} />
                      <Text style={s.cancelBtnTxt}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {selectedOrder.status === 'en_attente' && (
                  <View style={s.actionsBox}>
                    <TouchableOpacity style={[s.assignBtn, { backgroundColor: '#16a34a' }]} onPress={() => updateStatus(selectedOrder.id, 'livree')} disabled={loadingAction}>
                      {loadingAction ? <ActivityIndicator color="white" /> : <><IconCheck size={18} /><Text style={s.assignBtnTxt}>Marquer livrée</Text></>}
                    </TouchableOpacity>
                    <TouchableOpacity style={s.cancelBtn} onPress={() => cancelOrder(selectedOrder.id)} disabled={loadingAction}>
                      <IconCancel size={16} color={RED} />
                      <Text style={s.cancelBtnTxt}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity style={s.closeSheetBtn} onPress={() => setShowTicket(false)}>
                  <Text style={s.closeSheetTxt}>Fermer</Text>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Driver Modal */}
      <Modal visible={showDriverModal} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={[s.sheet, { maxHeight: '50%' }]}>
            <View style={s.handle} />
            <Text style={s.modalTitle}>Choisir un livreur</Text>
            {drivers.length === 0 ? (
              <View style={s.noDriver}><Text style={s.noDriverTxt}>⚠️ Aucun livreur disponible</Text></View>
            ) : (
              <ScrollView>
                {drivers.map(driver => (
                  <TouchableOpacity key={driver.id} style={s.driverItem} onPress={() => assignDriver(selectedOrder?.id, driver.id)} disabled={loadingAction}>
                    <View style={s.driverAvatar}>
                      <Text style={s.driverAvatarTxt}>{driver.full_name[0].toUpperCase()}</Text>
                    </View>
                    <Text style={s.driverName}>{driver.full_name}</Text>
                    {loadingAction && <ActivityIndicator size="small" color={PURPLE} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={s.closeSheetBtn} onPress={() => setShowDriverModal(false)}>
              <Text style={s.closeSheetTxt}>Fermer</Text>
            </TouchableOpacity>
            <View style={{ height: 20 }} />
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={[s.sheet, { maxHeight: '60%' }]}>
            <View style={s.handle} />
            <View style={s.filterHeader}>
              <Text style={s.modalTitle}>Filtres</Text>
              <TouchableOpacity onPress={() => { setFilterSchool(''); setFilterNiveau(''); }}>
                <Text style={s.resetTxt}>Réinitialiser</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.lbl}>ÉCOLE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                {allSchools.map(school => (
                  <TouchableOpacity key={school} style={[s.filterChip, filterSchool === school && { backgroundColor: PURPLE, borderColor: PURPLE }]} onPress={() => setFilterSchool(filterSchool === school ? '' : school)}>
                    <Text style={[s.filterChipTxt, filterSchool === school && { color: 'white' }]}>{school}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={[s.lbl, { marginTop: 16 }]}>NIVEAU</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                {allNiveaux.map(niveau => (
                  <TouchableOpacity key={niveau} style={[s.filterChip, filterNiveau === niveau && { backgroundColor: PURPLE, borderColor: PURPLE }]} onPress={() => setFilterNiveau(filterNiveau === niveau ? '' : niveau)}>
                    <Text style={[s.filterChipTxt, filterNiveau === niveau && { color: 'white' }]}>{niveau}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={[s.assignBtn, { marginTop: 24 }]} onPress={() => setShowFilterModal(false)}>
              <Text style={s.assignBtnTxt}>Appliquer</Text>
            </TouchableOpacity>
            <View style={{ height: 20 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  header: { backgroundColor: PURPLE, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, overflow: 'hidden' },
  dec1: { position: 'absolute', top: -50, right: -50, width: 180, height: 180, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 90 },
  dec2: { position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 60 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 20, fontWeight: '900', color: 'white' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: 'white' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  headerActions: { flexDirection: 'row', gap: 8 },
  filterBtn: { width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  filterDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: RED },
  logoutBtn: { width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statNum: { fontSize: 20, fontWeight: '900', color: 'white' },
  statLbl: { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '700', textAlign: 'center' },
  tabs: { flexDirection: 'row', gap: 6, paddingBottom: 4 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tabTxt: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  tabBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeTxt: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)' },
  scroll: { padding: 16 },
  card: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: 'rgba(15,35,86,0.06)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderNum: { fontSize: 15, fontWeight: '900', color: NAV },
  orderDate: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusTxt: { fontSize: 11, fontWeight: '800' },
  cardMid: { gap: 4, marginBottom: 10 },
  studentName: { fontSize: 14, fontWeight: '800', color: NAV },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailTxt: { fontSize: 12, color: '#718096' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10 },
  itemsCount: { fontSize: 12, color: '#9ca3af', fontWeight: '600' },
  total: { fontSize: 16, fontWeight: '900', color: PURPLE },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: '#f5f3ff', borderRadius: 8, padding: 8 },
  driverTxt: { fontSize: 12, color: PURPLE, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 70, gap: 14 },
  emptyIcon: { width: 90, height: 90, borderRadius: 28, backgroundColor: '#f5f3ff', justifyContent: 'center', alignItems: 'center' },
  emptyTxt: { fontSize: 17, fontWeight: '900', color: NAV },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, maxHeight: '92%' },
  handle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  ticketNum: { fontSize: 20, fontWeight: '900', color: NAV },
  ticketDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#9ca3af', letterSpacing: 1.2, marginBottom: 8 },
  infoBox: { backgroundColor: '#f7f8fc', borderRadius: 14, padding: 14, marginBottom: 16 },
  infoName: { fontSize: 15, fontWeight: '800', color: NAV, marginBottom: 4 },
  infoSub: { fontSize: 13, color: '#718096', marginTop: 2 },
  productsBox: { backgroundColor: '#f7f8fc', borderRadius: 14, padding: 14, marginBottom: 16 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  productName: { flex: 1, fontSize: 13, color: NAV, fontWeight: '600' },
  productRight: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  productQty: { fontSize: 13, color: '#9ca3af', fontWeight: '700' },
  productPrice: { fontSize: 13, fontWeight: '800', color: PURPLE, minWidth: 80, textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 },
  totalLabel: { fontSize: 13, fontWeight: '900', color: NAV },
  totalAmount: { fontSize: 18, fontWeight: '900', color: PURPLE },
  actionsBox: { gap: 10, marginBottom: 8 },
  assignBtn: { backgroundColor: PURPLE, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  assignBtnTxt: { color: 'white', fontWeight: '800', fontSize: 15 },
  cancelBtn: { backgroundColor: '#fef2f2', borderRadius: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#fecaca' },
  cancelBtnTxt: { color: RED, fontWeight: '800', fontSize: 14 },
  closeSheetBtn: { backgroundColor: '#f3f4f6', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  closeSheetTxt: { color: '#374151', fontWeight: '700', fontSize: 14 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: NAV, marginBottom: 16 },
  noDriver: { backgroundColor: '#fef9c3', borderRadius: 12, padding: 16, marginBottom: 16 },
  noDriverTxt: { fontSize: 13, color: '#92400e', fontWeight: '600' },
  driverItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: '#f7f8fc', borderRadius: 14, marginBottom: 8 },
  driverAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center' },
  driverAvatarTxt: { fontSize: 18, fontWeight: '900', color: 'white' },
  driverName: { flex: 1, fontSize: 15, fontWeight: '800', color: NAV },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  resetTxt: { fontSize: 13, color: RED, fontWeight: '700' },
  lbl: { fontSize: 10, fontWeight: '800', color: '#9ca3af', letterSpacing: 1.2, marginBottom: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#f7f8fc' },
  filterChipTxt: { fontSize: 13, fontWeight: '700', color: '#374151' },
});