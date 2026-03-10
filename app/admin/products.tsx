import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, Image, Modal, RefreshControl,
    ScrollView, StatusBar, StyleSheet, Text,
    TextInput, TouchableOpacity, View,
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { supabase } from '../../lib/supabase';

const NAV = '#0f2356';
const RED = '#e53e3e';
const GREEN = '#059669';
const ORANGE = '#d97706';
const PURPLE = '#7c3aed';
const SUPABASE_URL = 'https://gfwvvvtwafvykpadckyu.supabase.co';

function IconBack({ size = 20, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconPlus({ size = 18, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={2.5} strokeLinecap="round" /><Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={2.5} strokeLinecap="round" /></Svg>; }
function IconEdit({ size = 16, color = NAV }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconTrash({ size = 16, color = RED }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth={2} strokeLinecap="round" /><Path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M10 11v6M14 11v6" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IconImage({ size = 20, color = '#9ca3af' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={2} /><Circle cx="8.5" cy="8.5" r="1.5" fill={color} /><Polyline points="21 15 16 10 5 21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconPdf({ size = 20, color = RED }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="14 2 14 8 20 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Line x1="9" y1="15" x2="15" y2="15" stroke={color} strokeWidth={2} strokeLinecap="round" /><Line x1="9" y1="11" x2="15" y2="11" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IconBook({ size = 20, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconBox({ size = 20, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconBell({ size = 20, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconCheck({ size = 14, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="20 6 9 17 4 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconShield({ size = 14, color = ORANGE }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconEye({ size = 16, color = RED }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} /></Svg>; }

const TABS = [
  { key: 'fournitures', label: 'Fournitures', color: GREEN, icon: IconBook },
  { key: 'catalogue', label: 'Catalogue', color: PURPLE, icon: IconBox },
  { key: 'annonces', label: 'Annonces', color: ORANGE, icon: IconBell },
];

const NIVEAU_BRANCHES: any = {
  'TC': ['Sciences', 'Lettres et Sciences Humaines'],
  '1BAC': ['Sciences X', 'Sciences Math', 'Sciences Économiques', 'Lettres et Sciences Humaines'],
  '2BAC': ['Math', 'Physique', 'SVT', 'Économie', 'Gestion', 'Lettres et Sciences Humaines'],
};

async function uploadFile(folder: string, uri: string, type: 'image' | 'pdf') {
  const fileName = `${folder}/${Date.now()}.${type === 'pdf' ? 'pdf' : 'jpg'}`;
  const formData = new FormData();
  formData.append('file', { uri, name: fileName, type: type === 'pdf' ? 'application/pdf' : 'image/jpeg' } as any);
  const { error } = await supabase.storage.from('products').upload(fileName, formData, {
    contentType: type === 'pdf' ? 'application/pdf' : 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;
  return `${SUPABASE_URL}/storage/v1/object/public/products/${fileName}`;
}

export default function AdminProducts() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('fournitures');
  const [schools, setSchools] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [fournitures, setFournitures] = useState<any[]>([]);
  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fourniture state
  const [showFModal, setShowFModal] = useState(false);
  const [editF, setEditF] = useState<any>(null);
  const [fName, setFName] = useState('');
  const [fSchools, setFSchools] = useState<string[]>([]);
  const [fLevels, setFLevels] = useState<string[]>([]);
  const [fBranches, setFBranches] = useState<string[]>([]);
  const [fWrapping, setFWrapping] = useState('0');
  const [fItems, setFItems] = useState<any[]>([]);
  const [fItemName, setFItemName] = useState('');
  const [fItemPrice, setFItemPrice] = useState('');
  const [fItemImage, setFItemImage] = useState<string | null>(null);
  const [fItemUploading, setFItemUploading] = useState(false);
  const [fPdf, setFPdf] = useState<string | null>(null);
  const [fPdfName, setFPdfName] = useState('');
  const [fPdfUploading, setFPdfUploading] = useState(false);

  // Catalogue state
  const [showCModal, setShowCModal] = useState(false);
  const [editC, setEditC] = useState<any>(null);
  const [cName, setCName] = useState('');
  const [cPrice, setCPrice] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cSchools, setCSchools] = useState<string[]>([]);
  const [cLevels, setCLevels] = useState<string[]>([]);
  const [cBranches, setCBranches] = useState<string[]>([]);
  const [cImage, setCImage] = useState<string | null>(null);
  const [cImgUploading, setCImgUploading] = useState(false);

  // Annonce state
  const [showAModal, setShowAModal] = useState(false);
  const [editA, setEditA] = useState<any>(null);
  const [aTitle, setATitle] = useState('');
  const [aContent, setAContent] = useState('');
  const [aSchools, setASchools] = useState<string[]>([]);
  const [aLevels, setALevels] = useState<string[]>([]);
  const [aBranches, setABranches] = useState<string[]>([]);
  const [aType, setAType] = useState('annonce');
  const [aImage, setAImage] = useState<string | null>(null);
  const [aImgUploading, setAImgUploading] = useState(false);

  // PDF viewer state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setRefreshing(true);
    const [sc, lv, fo, ca, an] = await Promise.all([
      supabase.from('schools').select('id,name,abbreviation').eq('is_active', true).order('name'),
      supabase.from('levels').select('id,name').order('order_index'),
      supabase.from('fournitures').select('*, items:fourniture_items(id,name,price,image_url)').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('announcements').select('id,title,body,image_url,school_ids,level_ids,branches,type,is_active,created_at').order('created_at', { ascending: false }),
    ]);
    setSchools(sc.data || []);
    const uniqueLevels = (lv.data || []).filter((l: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.name === l.name) === i);
    setLevels(uniqueLevels);
    setFournitures(fo.data || []);
    setCatalogue(ca.data || []);
    setAnnonces(an.data || []);
    setRefreshing(false);
  }

  function toggle(arr: string[], setArr: any, val: string) {
    setArr((p: string[]) => p.includes(val) ? p.filter(x => x !== val) : [...p, val]);
  }

  function getAvailBranches(selLevelIds: string[]) {
    const bs = new Set<string>();
    selLevelIds.forEach(id => {
      const lv = levels.find((l: any) => l.id === id);
      if (lv && NIVEAU_BRANCHES[lv.name]) NIVEAU_BRANCHES[lv.name].forEach((b: string) => bs.add(b));
    });
    return Array.from(bs);
  }

  async function pickImage(setImg: any, setUploading: any, folder: string) {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission requise', 'Autorisez l\'accès aux photos'); return; }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.75 });
      if (!res.canceled && res.assets[0]) {
        setUploading(true);
        const url = await uploadFile(folder, res.assets[0].uri, 'image');
        setImg(url);
        setUploading(false);
      }
    } catch (e: any) { Alert.alert('Erreur upload', e.message); setUploading(false); }
  }

  async function pickPdf() {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!res.canceled && res.assets[0]) {
        setFPdfUploading(true);
        const url = await uploadFile('fournitures/pdfs', res.assets[0].uri, 'pdf');
        setFPdf(url); setFPdfName(res.assets[0].name);
        setFPdfUploading(false);
      }
    } catch (e: any) { Alert.alert('Erreur', e.message); setFPdfUploading(false); }
  }

  async function pickItemImg() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission requise', 'Autorisez l\'accès aux photos'); return; }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
      if (!res.canceled && res.assets[0]) {
        setFItemUploading(true);
        const url = await uploadFile('fournitures/items', res.assets[0].uri, 'image');
        setFItemImage(url);
        setFItemUploading(false);
      }
    } catch (e: any) { Alert.alert('Erreur', e.message); setFItemUploading(false); }
  }

  // FOURNITURE CRUD
  function openAddF() {
    setEditF(null); setFName(''); setFSchools([]); setFLevels([]); setFBranches([]);
    setFWrapping('0'); setFItems([]); setFItemName(''); setFItemPrice('');
    setFItemImage(null); setFPdf(null); setFPdfName('');
    setShowFModal(true);
  }

  function openEditF(f: any) {
    setEditF(f); setFName(f.name || '');
    setFSchools(f.school_ids || []); setFLevels(f.level_ids || []); setFBranches(f.branches || []);
    setFWrapping(String(f.wrapping_price || 0));
    setFItems((f.items || []).map((i: any) => ({ ...i })));
    setFPdf(f.pdf_url || null); setFPdfName(f.pdf_url ? 'fichier.pdf' : '');
    setFItemName(''); setFItemPrice(''); setFItemImage(null);
    setShowFModal(true);
  }

  function addFItem() {
    if (!fItemName.trim()) { Alert.alert('Erreur', 'Entrez le nom'); return; }
    if (!fItemPrice || isNaN(parseFloat(fItemPrice))) { Alert.alert('Erreur', 'Entrez un prix valide'); return; }
    setFItems(p => [...p, { name: fItemName.trim(), price: parseFloat(fItemPrice), image_url: fItemImage }]);
    setFItemName(''); setFItemPrice(''); setFItemImage(null);
  }

  async function saveF() {
    if (!fName.trim()) { Alert.alert('Erreur', 'Entrez le nom'); return; }
    if (fSchools.length === 0) { Alert.alert('Erreur', 'Choisissez au moins une école'); return; }
    if (fLevels.length === 0) { Alert.alert('Erreur', 'Choisissez au moins un niveau'); return; }
    if (fItems.length === 0) { Alert.alert('Erreur', 'Ajoutez au moins un article'); return; }
    setLoading(true);
    try {
      const payload: any = { name: fName.trim(), school_ids: fSchools, level_ids: fLevels, branches: fBranches, wrapping_price: parseFloat(fWrapping) || 0, pdf_url: fPdf || null, is_active: true };
      let fid = editF?.id;
      if (editF) {
        const { error } = await supabase.from('fournitures').update(payload).eq('id', editF.id);
        if (error) throw error;
        await supabase.from('fourniture_items').delete().eq('fourniture_id', editF.id);
      } else {
        const { data, error } = await supabase.from('fournitures').insert(payload).select().single();
        if (error) throw error;
        fid = data.id;
      }
      const { error: ie } = await supabase.from('fourniture_items').insert(fItems.map(it => ({ fourniture_id: fid, name: it.name, price: it.price, image_url: it.image_url || null })));
      if (ie) throw ie;
      setShowFModal(false); await loadData();
      Alert.alert('✅ Succès', editF ? 'Fourniture modifiée' : 'Fourniture créée');
    } catch (e: any) { Alert.alert('Erreur', e.message); }
    setLoading(false);
  }

  async function deleteF(id: string) {
    Alert.alert('Supprimer ?', 'Action irréversible', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await supabase.from('fournitures').delete().eq('id', id); loadData(); } },
    ]);
  }

  // CATALOGUE CRUD
  function openAddC() {
    setEditC(null); setCName(''); setCPrice(''); setCDesc('');
    setCSchools([]); setCLevels([]); setCBranches([]); setCImage(null);
    setShowCModal(true);
  }

  function openEditC(p: any) {
    setEditC(p); setCName(p.name || ''); setCPrice(String(p.price || ''));
    setCDesc(p.description || ''); setCSchools(p.school_ids || []); setCLevels(p.level_ids || []);
    setCBranches(p.branches || []); setCImage(p.image_url || null);
    setShowCModal(true);
  }

  async function saveC() {
    if (!cName.trim()) { Alert.alert('Erreur', 'Entrez le nom'); return; }
    if (!cPrice || isNaN(parseFloat(cPrice))) { Alert.alert('Erreur', 'Entrez un prix valide'); return; }
    setLoading(true);
    try {
      const payload: any = { name: cName.trim(), price: parseFloat(cPrice), description: cDesc || null, school_ids: cSchools, level_ids: cLevels, branches: cBranches, image_url: cImage || null, category: 'general', is_active: true };
      if (cSchools.length === 1) payload.school_id = cSchools[0];
      if (cLevels.length === 1) payload.level_id = cLevels[0];
      if (editC) {
        const { error } = await supabase.from('products').update(payload).eq('id', editC.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }
      setShowCModal(false); await loadData();
      Alert.alert('✅ Succès', editC ? 'Produit modifié' : 'Produit ajouté');
    } catch (e: any) { Alert.alert('Erreur', e.message); }
    setLoading(false);
  }

  async function deleteC(id: string) {
    Alert.alert('Supprimer ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await supabase.from('products').delete().eq('id', id); loadData(); } },
    ]);
  }

  // ANNONCE CRUD
  function openAddA() {
    setEditA(null); setATitle(''); setAContent('');
    setASchools([]); setALevels([]); setABranches([]);
    setAType('annonce'); setAImage(null);
    setShowAModal(true);
  }

  function openEditA(a: any) {
    setEditA(a); setATitle(a.title || ''); setAContent(a.body || '');
    setASchools(a.school_ids || []); setALevels(a.level_ids || []);
    setABranches(a.branches || []); setAType(a.type || 'annonce'); setAImage(a.image_url || null);
    setShowAModal(true);
  }

  async function saveA() {
    if (!aTitle.trim()) { Alert.alert('Erreur', 'Entrez le titre'); return; }
    if (aSchools.length === 0) { Alert.alert('Erreur', 'Choisissez au moins une école'); return; }
    setLoading(true);
    try {
      const payload: any = { title: aTitle.trim(), body: aContent || null, school_ids: aSchools, level_ids: aLevels, branches: aBranches, type: aType, is_active: true, image_url: aImage || null };
      if (aSchools.length === 1) payload.school_id = aSchools[0];
      if (aLevels.length === 1) payload.level_id = aLevels[0];
      if (editA) {
        const { error } = await supabase.from('announcements').update(payload).eq('id', editA.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('announcements').insert(payload);
        if (error) throw error;
      }
      setShowAModal(false); await loadData();
      Alert.alert('✅ Succès', editA ? 'Annonce modifiée' : 'Annonce publiée');
    } catch (e: any) { Alert.alert('Erreur', e.message); }
    setLoading(false);
  }

  async function deleteA(id: string) {
    Alert.alert('Supprimer ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await supabase.from('announcements').delete().eq('id', id); loadData(); } },
    ]);
  }

  function getNames(ids: string[], arr: any[]) {
    return arr.filter(x => ids?.includes(x.id)).map(x => x.abbreviation || x.name).join(', ');
  }

  const activeColor = TABS.find(t => t.key === activeTab)?.color || NAV;

  function SchoolSel({ sel, setSel, color }: any) {
    const allSel = sel.length === schools.length && schools.length > 0;
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
          <TouchableOpacity style={[s.chip, allSel && { backgroundColor: color, borderColor: color }]} onPress={() => setSel(allSel ? [] : schools.map((x: any) => x.id))}>
            <IconCheck size={11} color={allSel ? 'white' : color} /><Text style={[s.chipTxt, allSel && { color: 'white' }]}>Tous</Text>
          </TouchableOpacity>
          {schools.map((sc: any) => (
            <TouchableOpacity key={sc.id} style={[s.chip, sel.includes(sc.id) && { backgroundColor: color, borderColor: color }]} onPress={() => toggle(sel, setSel, sc.id)}>
              <Text style={[s.chipTxt, sel.includes(sc.id) && { color: 'white' }]}>{sc.abbreviation || sc.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  function LevelSel({ sel, setSel, color }: any) {
    const allSel = sel.length === levels.length && levels.length > 0;
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
          <TouchableOpacity style={[s.chip, allSel && { backgroundColor: color, borderColor: color }]} onPress={() => setSel(allSel ? [] : levels.map((x: any) => x.id))}>
            <IconCheck size={11} color={allSel ? 'white' : color} /><Text style={[s.chipTxt, allSel && { color: 'white' }]}>Tous</Text>
          </TouchableOpacity>
          {levels.map((lv: any) => (
            <TouchableOpacity key={lv.id} style={[s.chip, sel.includes(lv.id) && { backgroundColor: color, borderColor: color }]} onPress={() => toggle(sel, setSel, lv.id)}>
              <Text style={[s.chipTxt, sel.includes(lv.id) && { color: 'white' }]}>{lv.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  function BranchSel({ selLvIds, sel, setSel, color }: any) {
    const branches = getAvailBranches(selLvIds);
    if (branches.length === 0) return null;
    const allSel = sel.length === branches.length && branches.length > 0;
    return (
      <>
        <Text style={s.lbl}>BRANCHE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
            <TouchableOpacity style={[s.chip, allSel && { backgroundColor: color, borderColor: color }]} onPress={() => setSel(allSel ? [] : branches)}>
              <IconCheck size={11} color={allSel ? 'white' : color} /><Text style={[s.chipTxt, allSel && { color: 'white' }]}>Tous</Text>
            </TouchableOpacity>
            {branches.map((b: string) => (
              <TouchableOpacity key={b} style={[s.chip, sel.includes(b) && { backgroundColor: color, borderColor: color }]} onPress={() => toggle(sel, setSel, b)}>
                <Text style={[s.chipTxt, sel.includes(b) && { color: 'white' }]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={activeColor} />
      <View style={[s.header, { backgroundColor: activeColor }]}>
        <View style={s.dec1} /><View style={s.dec2} />
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}><IconBack /></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Produits & Annonces</Text>
            <Text style={s.headerSub}>Gestion du catalogue</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => { if (activeTab === 'fournitures') openAddF(); else if (activeTab === 'catalogue') openAddC(); else openAddA(); }}><IconPlus /></TouchableOpacity>
        </View>
        <View style={s.statsRow}>
          <View style={s.statBox}><Text style={s.statNum}>{fournitures.length}</Text><Text style={s.statLbl}>Fournitures</Text></View>
          <View style={s.statBox}><Text style={s.statNum}>{catalogue.length}</Text><Text style={s.statLbl}>Catalogue</Text></View>
          <View style={s.statBox}><Text style={s.statNum}>{annonces.length}</Text><Text style={s.statLbl}>Annonces</Text></View>
        </View>
        <View style={s.tabs}>
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity key={tab.key} style={[s.tab, active && { backgroundColor: 'rgba(255,255,255,0.25)' }]} onPress={() => setActiveTab(tab.key)}>
                {React.createElement(tab.icon, { size: 14, color: active ? 'white' : 'rgba(255,255,255,0.6)' })}
                <Text style={[s.tabTxt, active && { color: 'white' }]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={activeColor} />} showsVerticalScrollIndicator={false}>

        {/* FOURNITURES */}
        {activeTab === 'fournitures' && (fournitures.length === 0 ? (
          <View style={s.empty}><View style={[s.emptyIcon, { backgroundColor: GREEN + '18' }]}><IconBook size={40} color={GREEN} /></View><Text style={s.emptyTxt}>Aucune fourniture</Text><TouchableOpacity style={[s.emptyBtn, { backgroundColor: GREEN }]} onPress={openAddF}><IconPlus /><Text style={s.emptyBtnTxt}>Ajouter</Text></TouchableOpacity></View>
        ) : fournitures.map(f => (
          <View key={f.id} style={s.card}>
            <View style={s.cardHeader}>
              <View style={[s.cardIcon, { backgroundColor: GREEN + '15' }]}><IconBook size={22} color={GREEN} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{f.name}</Text>
                {f.school_ids?.length > 0 && <Text style={s.cardMeta}>{getNames(f.school_ids, schools)}</Text>}
                {f.level_ids?.length > 0 && <Text style={s.cardMeta2}>{getNames(f.level_ids, levels)}{f.branches?.length > 0 ? ` • ${f.branches.join(', ')}` : ''}</Text>}
              </View>
              <View style={s.cardActions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => openEditF(f)}><IconEdit size={14} /></TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#fef2f2' }]} onPress={() => deleteF(f.id)}><IconTrash size={14} /></TouchableOpacity>
              </View>
            </View>
            <View style={s.itemsList}>
              {f.items?.slice(0, 3).map((item: any, i: number) => (
                <View key={i} style={s.itemRow}>
                  {item.image_url ? <Image source={{ uri: item.image_url }} style={s.itemImg} /> : <View style={[s.itemImg, { backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center' }]}><IconImage size={14} color={GREEN} /></View>}
                  <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={s.itemPrice}>{Number(item.price).toFixed(2)} MAD</Text>
                </View>
              ))}
              {(f.items?.length || 0) > 3 && <Text style={s.moreItems}>+{f.items.length - 3} autres articles</Text>}
            </View>
            <View style={s.cardFooter}>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                <View style={[s.badge, { backgroundColor: GREEN + '15' }]}><Text style={[s.badgeTxt, { color: GREEN }]}>{f.items?.length || 0} articles</Text></View>
                {f.wrapping_price > 0 && <View style={[s.badge, { backgroundColor: ORANGE + '15' }]}><IconShield size={10} /><Text style={[s.badgeTxt, { color: ORANGE }]}>Protéger +{f.wrapping_price}</Text></View>}
                {f.pdf_url && (
                  <TouchableOpacity style={[s.badge, { backgroundColor: RED + '15' }]} onPress={() => { setPdfUrl(f.pdf_url); setShowPdfModal(true); }}>
                    <IconEye size={10} color={RED} /><Text style={[s.badgeTxt, { color: RED }]}>PDF</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={s.totalPrice}>{(f.items?.reduce((sum: number, i: any) => sum + Number(i.price), 0) || 0).toFixed(2)} MAD</Text>
            </View>
          </View>
        )))}

        {/* CATALOGUE */}
        {activeTab === 'catalogue' && (catalogue.length === 0 ? (
          <View style={s.empty}><View style={[s.emptyIcon, { backgroundColor: PURPLE + '18' }]}><IconBox size={40} color={PURPLE} /></View><Text style={s.emptyTxt}>Aucun produit</Text><TouchableOpacity style={[s.emptyBtn, { backgroundColor: PURPLE }]} onPress={openAddC}><IconPlus /><Text style={s.emptyBtnTxt}>Ajouter</Text></TouchableOpacity></View>
        ) : catalogue.map(p => (
          <View key={p.id} style={s.card}>
            <View style={s.cardHeader}>
              {p.image_url ? <Image source={{ uri: p.image_url }} style={s.prodImg} /> : <View style={[s.prodImg, { backgroundColor: PURPLE + '15', justifyContent: 'center', alignItems: 'center' }]}><IconBox size={28} color={PURPLE} /></View>}
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{p.name}</Text>
                {p.description ? <Text style={s.cardDesc} numberOfLines={1}>{p.description}</Text> : null}
                {p.school_ids?.length > 0 && <Text style={s.cardMeta}>{getNames(p.school_ids, schools)}</Text>}
                {p.level_ids?.length > 0 && <Text style={s.cardMeta2}>{getNames(p.level_ids, levels)}</Text>}
              </View>
              <View style={s.cardActions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => openEditC(p)}><IconEdit size={14} /></TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#fef2f2' }]} onPress={() => deleteC(p.id)}><IconTrash size={14} /></TouchableOpacity>
              </View>
            </View>
            <View style={s.cardFooter}>
              <View style={[s.badge, { backgroundColor: p.is_active ? '#dcfce7' : '#f3f4f6' }]}><Text style={[s.badgeTxt, { color: p.is_active ? GREEN : '#9ca3af' }]}>{p.is_active ? 'Actif' : 'Inactif'}</Text></View>
              <Text style={s.totalPrice}>{Number(p.price).toFixed(2)} MAD</Text>
            </View>
          </View>
        )))}

        {/* ANNONCES */}
        {activeTab === 'annonces' && (annonces.length === 0 ? (
          <View style={s.empty}><View style={[s.emptyIcon, { backgroundColor: ORANGE + '18' }]}><IconBell size={40} color={ORANGE} /></View><Text style={s.emptyTxt}>Aucune annonce</Text><TouchableOpacity style={[s.emptyBtn, { backgroundColor: ORANGE }]} onPress={openAddA}><IconPlus /><Text style={s.emptyBtnTxt}>Ajouter</Text></TouchableOpacity></View>
        ) : annonces.map(a => (
          <View key={a.id} style={s.card}>
            <View style={s.cardHeader}>
              {a.image_url ? <Image source={{ uri: a.image_url }} style={s.prodImg} /> : <View style={[s.prodImg, { backgroundColor: ORANGE + '15', justifyContent: 'center', alignItems: 'center' }]}><IconBell size={28} color={ORANGE} /></View>}
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{a.title}</Text>
                {a.body ? <Text style={s.cardDesc} numberOfLines={2}>{a.body}</Text> : null}
                {a.school_ids?.length > 0 && <Text style={s.cardMeta}>{getNames(a.school_ids, schools)}</Text>}
                {a.level_ids?.length > 0 && <Text style={s.cardMeta2}>{getNames(a.level_ids, levels)}</Text>}
              </View>
              <View style={s.cardActions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => openEditA(a)}><IconEdit size={14} /></TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#fef2f2' }]} onPress={() => deleteA(a.id)}><IconTrash size={14} /></TouchableOpacity>
              </View>
            </View>
            <View style={s.cardFooter}>
              <View style={[s.badge, { backgroundColor: a.type === 'evenement' ? '#e0f2fe' : '#fef9c3' }]}>
                <Text style={[s.badgeTxt, { color: a.type === 'evenement' ? '#0369a1' : '#92400e' }]}>{a.type === 'evenement' ? '📅 Événement' : '📢 Annonce'}</Text>
              </View>
            </View>
          </View>
        )))}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* PDF VIEWER MODAL */}
      <Modal visible={showPdfModal} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={[s.sheet, { maxHeight: '85%' }]}>
            <View style={s.handle} />
            <View style={s.modalTop}>
              <Text style={s.modalTitle}>Aperçu PDF</Text>
              <TouchableOpacity style={s.closeBtn} onPress={() => setShowPdfModal(false)}><Text style={s.closeTxt}>✕</Text></TouchableOpacity>
            </View>
            <View style={{ flex: 1, backgroundColor: '#f7f8fc', borderRadius: 16, padding: 20, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <View style={{ width: 80, height: 80, backgroundColor: RED + '15', borderRadius: 24, justifyContent: 'center', alignItems: 'center' }}>
                <IconPdf size={40} color={RED} />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: NAV, textAlign: 'center' }}>Fichier PDF</Text>
              <Text style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }} numberOfLines={2}>{pdfUrl}</Text>
              <TouchableOpacity style={[s.saveBtn, { backgroundColor: RED, marginTop: 8, paddingHorizontal: 32 }]}
                onPress={() => { setShowPdfModal(false); Alert.alert('PDF', 'Lien copié:\n' + pdfUrl); }}>
                <Text style={s.saveTxt}>Voir le lien</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 24 }} />
          </View>
        </View>
      </Modal>

      {/* FOURNITURE MODAL */}
      <Modal visible={showFModal} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={s.modalTop}>
                <View><Text style={s.modalTitle}>{editF ? 'Modifier' : 'Nouvelle fourniture'}</Text><Text style={s.modalSub}>Liste d'articles scolaires</Text></View>
                <TouchableOpacity style={s.closeBtn} onPress={() => setShowFModal(false)}><Text style={s.closeTxt}>✕</Text></TouchableOpacity>
              </View>
              <Text style={s.lbl}>NOM *</Text>
              <View style={s.inputBox}><TextInput style={s.input} value={fName} onChangeText={setFName} placeholder="Ex: Fournitures CE1" placeholderTextColor="#9ca3af" /></View>
              <Text style={s.lbl}>ÉCOLES *</Text>
              <SchoolSel sel={fSchools} setSel={setFSchools} color={GREEN} />
              <Text style={s.lbl}>NIVEAUX *</Text>
              <LevelSel sel={fLevels} setSel={setFLevels} color={GREEN} />
              <BranchSel selLvIds={fLevels} sel={fBranches} setSel={setFBranches} color={GREEN} />
              <Text style={s.lbl}>PROTÉGER LES CAHIERS (MAD)</Text>
              <View style={s.inputBox}><TextInput style={s.input} value={fWrapping} onChangeText={setFWrapping} placeholder="0" placeholderTextColor="#9ca3af" keyboardType="numeric" /></View>
              <Text style={s.lbl}>PDF (optionnel)</Text>
              <TouchableOpacity style={s.uploadBtn} onPress={pickPdf} disabled={fPdfUploading}>
                {fPdfUploading ? <><ActivityIndicator color={GREEN} size="small" /><Text style={[s.uploadTxt, { color: GREEN }]}>Upload...</Text></>
                  : fPdf ? <><IconPdf size={18} color={GREEN} /><Text style={[s.uploadTxt, { color: GREEN }]}>{fPdfName} ✓</Text></>
                    : <><IconPdf size={18} /><Text style={s.uploadTxt}>Choisir un PDF</Text></>}
              </TouchableOpacity>
              <Text style={s.lbl}>AJOUTER UN ARTICLE</Text>
              <View style={s.addItemBox}>
                <View style={s.addItemRow}>
                  <View style={[s.inputBox, { flex: 1 }]}><TextInput style={s.input} value={fItemName} onChangeText={setFItemName} placeholder="Nom article" placeholderTextColor="#9ca3af" /></View>
                  <View style={[s.inputBox, { width: 90 }]}><TextInput style={s.input} value={fItemPrice} onChangeText={setFItemPrice} placeholder="Prix" placeholderTextColor="#9ca3af" keyboardType="numeric" /></View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' }}>
                  <TouchableOpacity style={[s.uploadBtn, { flex: 1, marginTop: 0 }]} onPress={pickItemImg} disabled={fItemUploading}>
                    {fItemUploading ? <><ActivityIndicator color={GREEN} size="small" /><Text style={[s.uploadTxt, { color: GREEN }]}>Upload...</Text></>
                      : fItemImage ? <><Image source={{ uri: fItemImage }} style={{ width: 24, height: 24, borderRadius: 6 }} /><Text style={[s.uploadTxt, { color: GREEN }]}>Photo ✓</Text></>
                        : <><IconImage size={16} /><Text style={s.uploadTxt}>Photo article</Text></>}
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.addItemBtn, { backgroundColor: GREEN }]} onPress={addFItem}><IconPlus size={16} /></TouchableOpacity>
                </View>
              </View>
              {fItems.length > 0 && (
                <View style={{ marginTop: 8, gap: 6 }}>
                  {fItems.map((item, i) => (
                    <View key={i} style={s.fItemRow}>
                      {item.image_url ? <Image source={{ uri: item.image_url }} style={s.fItemImg} /> : <View style={[s.fItemImg, { backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center' }]}><IconImage size={14} color={GREEN} /></View>}
                      <Text style={s.fItemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={s.fItemPrice}>{Number(item.price).toFixed(2)}</Text>
                      <TouchableOpacity onPress={() => setFItems(p => p.filter((_, j) => j !== i))}><IconTrash size={14} /></TouchableOpacity>
                    </View>
                  ))}
                  <View style={s.fTotalRow}>
                    <Text style={s.fTotalLbl}>Total articles</Text>
                    <Text style={s.fTotalAmt}>{fItems.reduce((sum, i) => sum + Number(i.price), 0).toFixed(2)} MAD</Text>
                  </View>
                </View>
              )}
              <TouchableOpacity style={[s.saveBtn, { backgroundColor: GREEN }]} onPress={saveF} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={s.saveTxt}>{editF ? 'Enregistrer' : 'Créer la fourniture'}</Text>}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CATALOGUE MODAL */}
      <Modal visible={showCModal} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={s.modalTop}>
                <View><Text style={s.modalTitle}>{editC ? 'Modifier' : 'Nouveau produit'}</Text><Text style={s.modalSub}>Catalogue général</Text></View>
                <TouchableOpacity style={s.closeBtn} onPress={() => setShowCModal(false)}><Text style={s.closeTxt}>✕</Text></TouchableOpacity>
              </View>
              <Text style={s.lbl}>PHOTO DU PRODUIT</Text>
              <TouchableOpacity style={[s.imagePicker, cImage && { borderStyle: 'solid', borderColor: PURPLE }]} onPress={() => pickImage(setCImage, setCImgUploading, 'catalogue')} disabled={cImgUploading}>
                {cImgUploading ? <ActivityIndicator color={PURPLE} size="large" />
                  : cImage ? <Image source={{ uri: cImage }} style={s.imagePreview} />
                    : <><IconImage size={40} color="#d1d5db" /><Text style={s.imagePickerTxt}>Appuyer pour ajouter une photo</Text></>}
              </TouchableOpacity>
              <Text style={s.lbl}>NOM *</Text>
              <View style={s.inputBox}><TextInput style={s.input} value={cName} onChangeText={setCName} placeholder="Nom du produit" placeholderTextColor="#9ca3af" /></View>
              <Text style={s.lbl}>PRIX (MAD) *</Text>
              <View style={s.inputBox}><TextInput style={s.input} value={cPrice} onChangeText={setCPrice} placeholder="0.00" placeholderTextColor="#9ca3af" keyboardType="numeric" /></View>
              <Text style={s.lbl}>DESCRIPTION</Text>
              <View style={[s.inputBox, { minHeight: 80 }]}><TextInput style={[s.input, { minHeight: 60 }]} value={cDesc} onChangeText={setCDesc} placeholder="Description..." placeholderTextColor="#9ca3af" multiline /></View>
              <Text style={s.lbl}>ÉCOLES (optionnel)</Text>
              <SchoolSel sel={cSchools} setSel={setCSchools} color={PURPLE} />
              <Text style={s.lbl}>NIVEAUX (optionnel)</Text>
              <LevelSel sel={cLevels} setSel={setCLevels} color={PURPLE} />
              <BranchSel selLvIds={cLevels} sel={cBranches} setSel={setCBranches} color={PURPLE} />
              <TouchableOpacity style={[s.saveBtn, { backgroundColor: PURPLE }]} onPress={saveC} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={s.saveTxt}>{editC ? 'Enregistrer' : 'Ajouter au catalogue'}</Text>}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ANNONCE MODAL */}
      <Modal visible={showAModal} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={s.modalTop}>
                <View><Text style={s.modalTitle}>{editA ? 'Modifier' : 'Nouvelle annonce'}</Text><Text style={s.modalSub}>Annonce ou événement</Text></View>
                <TouchableOpacity style={s.closeBtn} onPress={() => setShowAModal(false)}><Text style={s.closeTxt}>✕</Text></TouchableOpacity>
              </View>
              <Text style={s.lbl}>TYPE</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                {[{ k: 'annonce', l: '📢 Annonce' }, { k: 'evenement', l: '📅 Événement' }].map(t => (
                  <TouchableOpacity key={t.k} style={[s.chip, aType === t.k && { backgroundColor: ORANGE, borderColor: ORANGE }]} onPress={() => setAType(t.k)}>
                    <Text style={[s.chipTxt, aType === t.k && { color: 'white' }]}>{t.l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.lbl}>IMAGE (optionnel)</Text>
              <TouchableOpacity style={[s.imagePicker, { height: 150 }, aImage && { borderStyle: 'solid', borderColor: ORANGE }]} onPress={() => pickImage(setAImage, setAImgUploading, 'annonces')} disabled={aImgUploading}>
                {aImgUploading ? <ActivityIndicator color={ORANGE} size="large" />
                  : aImage ? <Image source={{ uri: aImage }} style={[s.imagePreview, { height: 148 }]} />
                    : <><IconImage size={36} color="#d1d5db" /><Text style={s.imagePickerTxt}>Ajouter une image</Text></>}
              </TouchableOpacity>
              <Text style={s.lbl}>TITRE *</Text>
              <View style={s.inputBox}><TextInput style={s.input} value={aTitle} onChangeText={setATitle} placeholder="Titre de l'annonce" placeholderTextColor="#9ca3af" /></View>
              <Text style={s.lbl}>CONTENU</Text>
              <View style={[s.inputBox, { minHeight: 100 }]}><TextInput style={[s.input, { minHeight: 80 }]} value={aContent} onChangeText={setAContent} placeholder="Contenu..." placeholderTextColor="#9ca3af" multiline /></View>
              <Text style={s.lbl}>ÉCOLES *</Text>
              <SchoolSel sel={aSchools} setSel={setASchools} color={ORANGE} />
              <Text style={s.lbl}>NIVEAUX (optionnel)</Text>
              <LevelSel sel={aLevels} setSel={setALevels} color={ORANGE} />
              <BranchSel selLvIds={aLevels} sel={aBranches} setSel={setABranches} color={ORANGE} />
              <TouchableOpacity style={[s.saveBtn, { backgroundColor: ORANGE }]} onPress={saveA} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={s.saveTxt}>{editA ? 'Enregistrer' : 'Publier'}</Text>}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  header: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, overflow: 'hidden' },
  dec1: { position: 'absolute', top: -50, right: -50, width: 180, height: 180, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 90 },
  dec2: { position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 60 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginTop: 1 },
  addBtn: { width: 40, height: 40, backgroundColor: RED, borderRadius: 13, justifyContent: 'center', alignItems: 'center', shadowColor: RED, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statNum: { fontSize: 22, fontWeight: '900', color: 'white' },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: 6 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tabTxt: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  scroll: { padding: 16 },
  card: { backgroundColor: 'white', borderRadius: 18, padding: 14, marginBottom: 12, shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: 'rgba(15,35,86,0.06)' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  cardIcon: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  prodImg: { width: 60, height: 60, borderRadius: 13 },
  cardTitle: { fontSize: 14, fontWeight: '900', color: NAV },
  cardMeta: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  cardMeta2: { fontSize: 11, color: '#9ca3af' },
  cardDesc: { fontSize: 11, color: '#718096', marginTop: 2 },
  cardActions: { gap: 6 },
  actionBtn: { width: 30, height: 30, backgroundColor: '#eef2ff', borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  itemsList: { gap: 6, marginBottom: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f7f8fc', borderRadius: 10, padding: 8 },
  itemImg: { width: 32, height: 32, borderRadius: 8 },
  itemName: { flex: 1, fontSize: 12, color: NAV, fontWeight: '600' },
  itemPrice: { fontSize: 12, fontWeight: '800', color: GREEN },
  moreItems: { fontSize: 11, color: '#9ca3af', textAlign: 'center', paddingVertical: 4, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeTxt: { fontSize: 10, fontWeight: '800' },
  totalPrice: { fontSize: 15, fontWeight: '900', color: NAV },
  empty: { alignItems: 'center', paddingVertical: 70, gap: 14 },
  emptyIcon: { width: 90, height: 90, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  emptyTxt: { fontSize: 17, fontWeight: '900', color: NAV },
  emptyBtn: { borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  emptyBtnTxt: { color: 'white', fontWeight: '800', fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, maxHeight: '92%' },
  handle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: NAV },
  modalSub: { fontSize: 12, color: '#9ca3af', fontWeight: '600', marginTop: 2 },
  closeBtn: { width: 34, height: 34, backgroundColor: '#f3f4f6', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  closeTxt: { fontSize: 16, color: '#374151', fontWeight: '700' },
  lbl: { fontSize: 10, fontWeight: '800', color: '#9ca3af', letterSpacing: 1.2, marginBottom: 8, marginTop: 16 },
  inputBox: { backgroundColor: '#f7f8fc', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: '#e5e7eb' },
  input: { fontSize: 15, color: NAV, fontWeight: '600' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#f7f8fc' },
  chipTxt: { fontSize: 13, fontWeight: '700', color: '#374151' },
  imagePicker: { height: 180, backgroundColor: '#f7f8fc', borderRadius: 16, borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: 8, overflow: 'hidden' },
  imagePreview: { width: '100%', height: '100%' },
  imagePickerTxt: { fontSize: 13, color: '#9ca3af', fontWeight: '600' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f7f8fc', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: '#e5e7eb' },
  uploadTxt: { fontSize: 13, color: '#9ca3af', fontWeight: '600' },
  addItemBox: { backgroundColor: '#f0fdf4', borderRadius: 16, padding: 12, borderWidth: 1.5, borderColor: '#bbf7d0', marginTop: 4 },
  addItemRow: { flexDirection: 'row', gap: 8 },
  addItemBtn: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  fItemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f7f8fc', borderRadius: 12, padding: 10 },
  fItemImg: { width: 36, height: 36, borderRadius: 9 },
  fItemName: { flex: 1, fontSize: 13, fontWeight: '700', color: NAV },
  fItemPrice: { fontSize: 13, fontWeight: '800', color: GREEN },
  fTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12, marginTop: 8 },
  fTotalLbl: { fontSize: 12, fontWeight: '800', color: GREEN },
  fTotalAmt: { fontSize: 16, fontWeight: '900', color: GREEN },
  saveBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 24, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  saveTxt: { color: 'white', fontWeight: '800', fontSize: 15 },
});