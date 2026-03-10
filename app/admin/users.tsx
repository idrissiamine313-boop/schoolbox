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
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { supabase } from '../../lib/supabase';

const NAV = '#0f2356';
const RED = '#e53e3e';

function IconBack({ size = 20, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconPlus({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={2.5} strokeLinecap="round" /><Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={2.5} strokeLinecap="round" /></Svg>;
}
function IconEdit({ size = 16, color = NAV }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconTrash({ size = 16, color = RED }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth={2} strokeLinecap="round" /><Path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M10 11v6M14 11v6" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>;
}
function IconToggleOn({ size = 18 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="1" y="6" width="22" height="12" rx="6" stroke="#16a34a" strokeWidth={2} /><Circle cx="16" cy="12" r="4" fill="#16a34a" /></Svg>;
}
function IconToggleOff({ size = 18 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="1" y="6" width="22" height="12" rx="6" stroke="#9ca3af" strokeWidth={2} /><Circle cx="8" cy="12" r="4" fill="#9ca3af" /></Svg>;
}
function IconSave({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="17 21 17 13 7 13 7 21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="7 3 7 8 15 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconAdmin({ size = 20, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconLibraire({ size = 20, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconLivreur({ size = 20, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="1" y="3" width="15" height="13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M16 8h4l3 3v5h-7V8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="5.5" cy="18.5" r="2.5" stroke={color} strokeWidth={2} /><Circle cx="18.5" cy="18.5" r="2.5" stroke={color} strokeWidth={2} /></Svg>;
}
function IconMail({ size = 14, color = '#718096' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="22,6 12,13 2,6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconPhone({ size = 14, color = '#718096' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.22 2.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconEye({ size = 18, color = '#9ca3af' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} /></Svg>;
}
function IconEyeOff({ size = 18, color = '#9ca3af' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Line x1="1" y1="1" x2="23" y2="23" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>;
}

const ROLES = {
  admin:    { label: 'Admin',    color: NAV,       icon: IconAdmin },
  libraire: { label: 'Libraire', color: '#7c3aed', icon: IconLibraire },
  livreur:  { label: 'Livreur',  color: '#0369a1', icon: IconLivreur },
};

const AVATAR_COLORS = ['#0f2356','#7c3aed','#0369a1','#dc2626','#059669','#d97706'];
function getAvatarColor(name: string) { return AVATAR_COLORS[(name?.charCodeAt(0)||0) % AVATAR_COLORS.length]; }
function getInitials(name: string) { return (name||'?').split(' ').map((w:string)=>w[0]).join('').toUpperCase().slice(0,2); }

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [libraries, setLibraries] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'admin'|'libraire'|'livreur'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin'|'libraire'|'livreur'>('admin');
  const [libraryId, setLibraryId] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setRefreshing(true);
    const [usersRes, libsRes] = await Promise.all([
      supabase.from('app_users').select('*, library:libraries(name)').order('created_at', { ascending: false }),
      supabase.from('libraries').select('id, name').eq('is_active', true),
    ]);
    setUsers(usersRes.data || []);
    setLibraries(libsRes.data || []);
    setRefreshing(false);
  }

  function openAdd() {
    setEditUser(null); setFullName(''); setEmail(''); setPhone(''); setPassword('');
    setRole(activeTab); setLibraryId(''); setShowPassword(false); setShowModal(true);
  }

  function openEdit(user: any) {
    setEditUser(user); setFullName(user.full_name||''); setEmail(user.email||'');
    setPhone(user.phone||''); setPassword(''); setRole(user.role);
    setLibraryId(user.library_id||''); setShowPassword(false); setShowModal(true);
  }

  async function saveUser() {
    if (!fullName.trim()) { Alert.alert('Erreur','Entrez le nom'); return; }
    if (!email.trim()) { Alert.alert('Erreur',"Entrez l'email"); return; }
    if (!editUser && !password) { Alert.alert('Erreur','Entrez le mot de passe'); return; }
    if (!editUser && password.length < 6) { Alert.alert('Erreur','Minimum 6 caractères'); return; }
    if ((role==='libraire'||role==='livreur') && !libraryId) { Alert.alert('Erreur','Choisissez une librairie'); return; }
    setLoading(true);
    try {
      if (editUser) {
        const { error } = await supabase.from('app_users').update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          role,
          library_id: (role==='libraire'||role==='livreur') ? libraryId : null,
        }).eq('id', editUser.id);
        if (error) { Alert.alert('Erreur', error.message); setLoading(false); return; }
      } else {
        const { error } = await supabase.rpc('create_app_user', {
          p_email: email.trim().toLowerCase(),
          p_password: password,
          p_full_name: fullName.trim(),
          p_role: role,
          p_phone: phone.trim() || null,
          p_library_id: (role==='libraire'||role==='livreur') ? libraryId : null,
        });
        if (error) { Alert.alert('Erreur', error.message); setLoading(false); return; }
      }
      setShowModal(false);
      loadData();
    } catch (e: any) { Alert.alert('Erreur', e.message); }
    setLoading(false);
  }

  async function toggleUser(user: any) {
    await supabase.from('app_users').update({ is_active: !user.is_active }).eq('id', user.id);
    loadData();
  }

  async function deleteUser(user: any) {
    Alert.alert('Supprimer', `Supprimer ${user.full_name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        await supabase.from('app_users').delete().eq('id', user.id);
        loadData();
      }}
    ]);
  }

  const filteredUsers = users.filter(u => u.role === activeTab);
  const counts = {
    admin: users.filter(u=>u.role==='admin').length,
    libraire: users.filter(u=>u.role==='libraire').length,
    livreur: users.filter(u=>u.role==='livreur').length,
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={NAV} />

      <View style={s.header}>
        <View style={s.dec1}/><View style={s.dec2}/>
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}><IconBack/></TouchableOpacity>
          <View style={{flex:1}}>
            <Text style={s.headerTitle}>Utilisateurs</Text>
            <Text style={s.headerSub}>{users.length} comptes</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={openAdd}><IconPlus/></TouchableOpacity>
        </View>

        <View style={s.statsRow}>
          {(Object.keys(ROLES) as Array<keyof typeof ROLES>).map(r => (
            <View key={r} style={s.statBox}>
              {React.createElement(ROLES[r].icon, {size:16, color:'rgba(255,255,255,0.8)'})}
              <Text style={s.statNum}>{counts[r]}</Text>
              <Text style={s.statLbl}>{ROLES[r].label}s</Text>
            </View>
          ))}
        </View>

        <View style={s.tabs}>
          {(Object.keys(ROLES) as Array<keyof typeof ROLES>).map(r => {
            const active = activeTab===r;
            return (
              <TouchableOpacity key={r} style={[s.tab, active&&{backgroundColor:ROLES[r].color}]} onPress={()=>setActiveTab(r)}>
                <Text style={[s.tabTxt, active&&{color:'white'}]}>{ROLES[r].label}s</Text>
                {counts[r]>0 && <View style={[s.tabBadge, active&&{backgroundColor:'rgba(255,255,255,0.3)'}]}><Text style={[s.tabBadgeTxt, active&&{color:'white'}]}>{counts[r]}</Text></View>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={NAV}/>} showsVerticalScrollIndicator={false}>
        {filteredUsers.length===0 ? (
          <View style={s.empty}>
            <View style={[s.emptyIcon,{backgroundColor:ROLES[activeTab].color+'18'}]}>
              {React.createElement(ROLES[activeTab].icon,{size:40,color:ROLES[activeTab].color})}
            </View>
            <Text style={s.emptyTxt}>Aucun {ROLES[activeTab].label}</Text>
            <TouchableOpacity style={[s.emptyBtn,{backgroundColor:ROLES[activeTab].color}]} onPress={openAdd}>
              <IconPlus/><Text style={s.emptyBtnTxt}>Ajouter un {ROLES[activeTab].label}</Text>
            </TouchableOpacity>
          </View>
        ) : filteredUsers.map(user => {
          const rc = ROLES[user.role as keyof typeof ROLES]?.color||NAV;
          return (
            <View key={user.id} style={s.card}>
              <View style={[s.avatar,{backgroundColor:getAvatarColor(user.full_name)}]}>
                <Text style={s.avatarTxt}>{getInitials(user.full_name)}</Text>
              </View>
              <View style={s.info}>
                <View style={s.nameRow}>
                  <Text style={s.name}>{user.full_name}</Text>
                  <View style={[s.roleBadge,{backgroundColor:rc+'18',borderColor:rc+'40'}]}>
                    <Text style={[s.roleBadgeTxt,{color:rc}]}>{ROLES[user.role as keyof typeof ROLES]?.label}</Text>
                  </View>
                </View>
                <View style={s.detail}><IconMail size={11}/><Text style={s.detailTxt} numberOfLines={1}>{user.email}</Text></View>
                {user.phone?<View style={s.detail}><IconPhone size={11}/><Text style={s.detailTxt}>{user.phone}</Text></View>:null}
                {user.library?.name?<View style={s.detail}><IconLibraire size={11} color="#9ca3af"/><Text style={s.detailTxt}>{user.library.name}</Text></View>:null}
                <View style={s.statusRow}>
                  <View style={[s.dot,{backgroundColor:user.is_active?'#16a34a':'#9ca3af'}]}/>
                  <Text style={[s.statusTxt,{color:user.is_active?'#16a34a':'#9ca3af'}]}>{user.is_active?'Actif':'Inactif'}</Text>
                </View>
              </View>
              <View style={s.actions}>
                <TouchableOpacity style={s.actionBtn} onPress={()=>openEdit(user)}><IconEdit size={15}/></TouchableOpacity>
                <TouchableOpacity style={s.actionBtn} onPress={()=>toggleUser(user)}>{user.is_active?<IconToggleOn size={15}/>:<IconToggleOff size={15}/>}</TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn,{backgroundColor:'#fef2f2'}]} onPress={()=>deleteUser(user)}><IconTrash size={15}/></TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{height:32}}/>
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.handle}/>
            <ScrollView showsVerticalScrollIndicator={false}>

              {fullName.trim() ? (
                <View style={{alignItems:'center',marginBottom:8}}>
                  <View style={[s.avatarBig,{backgroundColor:getAvatarColor(fullName)}]}>
                    <Text style={s.avatarBigTxt}>{getInitials(fullName)}</Text>
                  </View>
                </View>
              ) : null}

              <View style={s.modalTop}>
                <View>
                  <Text style={s.modalTitle}>{editUser?'Modifier':'Nouveau compte'}</Text>
                  <Text style={s.modalSub}>{editUser?'Mise à jour':'Créer un accès'}</Text>
                </View>
                <TouchableOpacity style={s.closeBtn} onPress={()=>setShowModal(false)}>
                  <Text style={s.closeTxt}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={s.lbl}>RÔLE</Text>
              <View style={s.roleRow}>
                {(Object.keys(ROLES) as Array<keyof typeof ROLES>).map(r => {
                  const active = role===r;
                  return (
                    <TouchableOpacity key={r} style={[s.roleChip, active&&{backgroundColor:ROLES[r].color,borderColor:ROLES[r].color}]} onPress={()=>{setRole(r);setLibraryId('');}}>
                      {React.createElement(ROLES[r].icon,{size:18,color:active?'white':ROLES[r].color})}
                      <Text style={[s.roleChipTxt,active&&{color:'white'}]}>{ROLES[r].label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={s.lbl}>NOM COMPLET *</Text>
              <View style={s.inputBox}><TextInput style={s.input} value={fullName} onChangeText={setFullName} placeholder="Nom complet" placeholderTextColor="#9ca3af"/></View>

              <Text style={s.lbl}>EMAIL *</Text>
              <View style={s.inputBox}><TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="email@example.com" placeholderTextColor="#9ca3af" keyboardType="email-address" autoCapitalize="none" editable={!editUser}/></View>

              <Text style={s.lbl}>TÉLÉPHONE</Text>
              <View style={s.inputBox}><TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="0612345678" placeholderTextColor="#9ca3af" keyboardType="phone-pad"/></View>

              <Text style={s.lbl}>{editUser?'NOUVEAU MOT DE PASSE (optionnel)':'MOT DE PASSE *'}</Text>
              <View style={[s.inputBox,{flexDirection:'row',alignItems:'center'}]}>
                <TextInput style={[s.input,{flex:1}]} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#9ca3af" secureTextEntry={!showPassword}/>
                <TouchableOpacity onPress={()=>setShowPassword(p=>!p)} style={{padding:4}}>
                  {showPassword?<IconEyeOff size={18} color={NAV}/>:<IconEye size={18}/>}
                </TouchableOpacity>
              </View>
              {password.length>0&&password.length<6&&<Text style={s.passWarn}>⚠️ Minimum 6 caractères</Text>}
              {password.length>=6&&<Text style={s.passOk}>✓ Mot de passe valide</Text>}

              {(role==='libraire'||role==='livreur')&&(
                <>
                  <Text style={s.lbl}>LIBRAIRIE *</Text>
                  {libraries.length===0?(
                    <View style={s.noLib}><Text style={s.noLibTxt}>⚠️ Créez d'abord une librairie</Text></View>
                  ):(
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{flexDirection:'row',gap:8,paddingVertical:4}}>
                        {libraries.map(lib=>(
                          <TouchableOpacity key={lib.id} style={[s.libChip,libraryId===lib.id&&{backgroundColor:ROLES[role].color,borderColor:ROLES[role].color}]} onPress={()=>setLibraryId(lib.id)}>
                            <Text style={[s.libChipTxt,libraryId===lib.id&&{color:'white'}]}>{lib.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  )}
                </>
              )}

              <TouchableOpacity style={[s.saveBtn,{backgroundColor:ROLES[role].color}]} onPress={saveUser} disabled={loading}>
                {loading?<ActivityIndicator color="white"/>:<><IconSave/><Text style={s.saveTxt}>{editUser?'Enregistrer':'Créer le compte'}</Text></>}
              </TouchableOpacity>
              <View style={{height:40}}/>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#f7f8fc'},
  header:{backgroundColor:NAV,paddingTop:52,paddingBottom:16,paddingHorizontal:16,overflow:'hidden'},
  dec1:{position:'absolute',top:-50,right:-50,width:180,height:180,backgroundColor:'rgba(255,255,255,0.04)',borderRadius:90},
  dec2:{position:'absolute',bottom:-30,left:-30,width:120,height:120,backgroundColor:'rgba(255,255,255,0.03)',borderRadius:60},
  headerRow:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:16},
  backBtn:{width:40,height:40,backgroundColor:'rgba(255,255,255,0.12)',borderRadius:13,justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'rgba(255,255,255,0.15)'},
  headerTitle:{fontSize:20,fontWeight:'900',color:'white'},
  headerSub:{fontSize:12,color:'rgba(255,255,255,0.6)',fontWeight:'600',marginTop:1},
  addBtn:{width:40,height:40,backgroundColor:RED,borderRadius:13,justifyContent:'center',alignItems:'center',shadowColor:RED,shadowOffset:{width:0,height:4},shadowOpacity:0.4,shadowRadius:8,elevation:6},
  statsRow:{flexDirection:'row',gap:10,marginBottom:14},
  statBox:{flex:1,backgroundColor:'rgba(255,255,255,0.08)',borderRadius:14,padding:12,alignItems:'center',gap:4,borderWidth:1,borderColor:'rgba(255,255,255,0.1)'},
  statNum:{fontSize:22,fontWeight:'900',color:'white'},
  statLbl:{fontSize:10,color:'rgba(255,255,255,0.6)',fontWeight:'700'},
  tabs:{flexDirection:'row',gap:6},
  tab:{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,backgroundColor:'rgba(255,255,255,0.08)',borderRadius:12,paddingVertical:10,borderWidth:1,borderColor:'rgba(255,255,255,0.1)'},
  tabTxt:{fontSize:13,fontWeight:'700',color:'rgba(255,255,255,0.7)'},
  tabBadge:{backgroundColor:'rgba(255,255,255,0.15)',borderRadius:10,paddingHorizontal:6,paddingVertical:2},
  tabBadgeTxt:{fontSize:10,fontWeight:'800',color:'rgba(255,255,255,0.7)'},
  scroll:{padding:16},
  card:{backgroundColor:'white',borderRadius:18,padding:14,marginBottom:10,flexDirection:'row',alignItems:'center',gap:12,shadowColor:NAV,shadowOffset:{width:0,height:3},shadowOpacity:0.07,shadowRadius:10,elevation:3,borderWidth:1,borderColor:'rgba(15,35,86,0.06)'},
  avatar:{width:52,height:52,borderRadius:16,justifyContent:'center',alignItems:'center'},
  avatarTxt:{fontSize:18,fontWeight:'900',color:'white'},
  info:{flex:1,gap:3},
  nameRow:{flexDirection:'row',alignItems:'center',gap:8,flexWrap:'wrap'},
  name:{fontSize:14,fontWeight:'900',color:NAV},
  roleBadge:{borderRadius:8,paddingHorizontal:8,paddingVertical:3,borderWidth:1},
  roleBadgeTxt:{fontSize:10,fontWeight:'800'},
  detail:{flexDirection:'row',alignItems:'center',gap:5},
  detailTxt:{fontSize:11,color:'#718096',flex:1},
  statusRow:{flexDirection:'row',alignItems:'center',gap:5,marginTop:2},
  dot:{width:6,height:6,borderRadius:3},
  statusTxt:{fontSize:11,fontWeight:'700'},
  actions:{gap:6},
  actionBtn:{width:32,height:32,backgroundColor:'#eef2ff',borderRadius:10,justifyContent:'center',alignItems:'center'},
  empty:{alignItems:'center',paddingVertical:70,gap:14},
  emptyIcon:{width:90,height:90,borderRadius:28,justifyContent:'center',alignItems:'center'},
  emptyTxt:{fontSize:17,fontWeight:'900',color:NAV},
  emptyBtn:{borderRadius:14,paddingHorizontal:24,paddingVertical:14,flexDirection:'row',alignItems:'center',gap:8},
  emptyBtnTxt:{color:'white',fontWeight:'800',fontSize:14},
  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.45)',justifyContent:'flex-end'},
  sheet:{backgroundColor:'white',borderTopLeftRadius:28,borderTopRightRadius:28,paddingHorizontal:24,paddingTop:12,maxHeight:'92%'},
  handle:{width:40,height:4,backgroundColor:'#e5e7eb',borderRadius:2,alignSelf:'center',marginBottom:12},
  avatarBig:{width:70,height:70,borderRadius:22,justifyContent:'center',alignItems:'center'},
  avatarBigTxt:{fontSize:26,fontWeight:'900',color:'white'},
  modalTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20},
  modalTitle:{fontSize:22,fontWeight:'900',color:NAV},
  modalSub:{fontSize:12,color:'#9ca3af',fontWeight:'600',marginTop:2},
  closeBtn:{width:34,height:34,backgroundColor:'#f3f4f6',borderRadius:10,justifyContent:'center',alignItems:'center'},
  closeTxt:{fontSize:16,color:'#374151',fontWeight:'700'},
  roleRow:{flexDirection:'row',gap:8,marginBottom:4},
  roleChip:{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,paddingVertical:12,borderRadius:14,borderWidth:1.5,borderColor:'#e5e7eb',backgroundColor:'#f7f8fc'},
  roleChipTxt:{fontSize:13,fontWeight:'800',color:'#374151'},
  lbl:{fontSize:10,fontWeight:'800',color:'#9ca3af',letterSpacing:1.2,marginBottom:8,marginTop:16},
  inputBox:{backgroundColor:'#f7f8fc',borderRadius:14,paddingHorizontal:16,paddingVertical:14,borderWidth:1.5,borderColor:'#e5e7eb'},
  input:{fontSize:15,color:NAV,fontWeight:'600'},
  passWarn:{fontSize:12,color:'#dc2626',fontWeight:'600',marginTop:6},
  passOk:{fontSize:12,color:'#16a34a',fontWeight:'600',marginTop:6},
  libChip:{paddingHorizontal:16,paddingVertical:10,borderRadius:20,borderWidth:1.5,borderColor:'#e5e7eb',backgroundColor:'#f7f8fc'},
  libChipTxt:{fontSize:13,fontWeight:'700',color:'#374151'},
  noLib:{backgroundColor:'#fef9c3',borderRadius:12,padding:14,borderWidth:1,borderColor:'#fde68a'},
  noLibTxt:{fontSize:12,color:'#92400e',fontWeight:'600'},
  saveBtn:{borderRadius:16,paddingVertical:16,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,marginTop:24,shadowOffset:{width:0,height:6},shadowOpacity:0.3,shadowRadius:12,elevation:6},
  saveTxt:{color:'white',fontWeight:'800',fontSize:15},
});