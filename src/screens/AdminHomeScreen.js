import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  IconButton,
  Pill,
  Screen,
  SegmentedControl,
  Skeleton,
  Spinner,
  theme,
} from '../ui/components';

export default function AdminHomeScreen({ navigation }) {
  const { user, signOut } = useContext(AuthContext);
  const [tab, setTab] = useState('shops');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all | active | disabled

  const role = tab === 'admins' ? 'admin' : tab === 'clients' ? 'client' : 'shop';

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { role };
      if (activeFilter === 'active') params.active = 'true';
      if (activeFilter === 'disabled') params.active = 'false';
      if (search.trim()) params.q = search.trim();
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.users || []);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load users';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }, [role, activeFilter, search]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch {
      // silent
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'stats') loadStats();
    else loadUsers();
  }, [tab, loadUsers, loadStats]);

  async function setActive(target, isActive) {
    const path = isActive ? `/admin/users/${target.id}/activate` : `/admin/users/${target.id}/deactivate`;
    try {
      await api.post(path);
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, isActive } : u)));
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Action failed');
    }
  }

  async function deleteUser(target) {
    Alert.alert(
      'Delete user',
      `Permanently delete "${target.email}" and all their cards & history? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/users/${target.id}`);
              setUsers((prev) => prev.filter((u) => u.id !== target.id));
            } catch (e) {
              Alert.alert('Error', e?.response?.data?.message || 'Delete failed');
            }
          },
        },
      ]
    );
  }

  const refresh = tab === 'stats' ? loadStats : loadUsers;

  const headerRight = (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {(tab === 'stats' ? statsLoading : loading) ? (
        <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size={20} />
        </View>
      ) : (
        <IconButton label="↻" onPress={refresh} />
      )}
      <Avatar name={user?.email || 'A'} color={theme.ink} />
    </View>
  );

  return (
    <Screen
      scroll={tab === 'stats'}
      title="Admin console"
      subtitle="Manage shops, clients and platform health."
      right={headerRight}
    >
      <Card style={{ paddingVertical: 8, paddingHorizontal: 8 }}>
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: 'shops', label: 'Shops' },
            { value: 'clients', label: 'Clients' },
            { value: 'admins', label: 'Admins' },
            { value: 'stats', label: 'Stats' },
          ]}
        />
      </Card>

      {tab === 'stats' ? (
        <StatsView loading={statsLoading} stats={stats} onOpen={(u) => navigation.navigate('AdminUser', { id: u.id })} />
      ) : (
        <>
          <Card delay={60}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 8, fontSize: 16, color: theme.subtle, fontWeight: '900' }}>⌕</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={`Search ${tab}…`}
                placeholderTextColor="rgba(11, 18, 32, 0.35)"
                onSubmitEditing={loadUsers}
                returnKeyType="search"
                style={{ flex: 1, fontSize: 15, color: theme.text, fontWeight: '600', paddingVertical: 8 }}
              />
              {search ? (
                <Pressable onPress={() => { setSearch(''); }}>
                  <Text style={{ color: theme.muted, fontWeight: '900', fontSize: 16 }}>×</Text>
                </Pressable>
              ) : null}
            </View>
            <View style={{ height: 8 }} />
            <SegmentedControl
              value={activeFilter}
              onChange={setActiveFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'disabled', label: 'Disabled' },
              ]}
            />
          </Card>

          {loading ? (
            <View style={{ marginTop: 12 }}>
              <Skeleton height={70} radius={18} style={{ marginBottom: 10 }} />
              <Skeleton height={70} radius={18} style={{ marginBottom: 10 }} />
              <Skeleton height={70} radius={18} />
            </View>
          ) : users.length === 0 ? (
            <Card style={{ marginTop: 12 }}>
              <EmptyState icon="·" title={`No ${tab}`} subtitle="Try adjusting the search or filter." />
            </Card>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              style={{ marginTop: 4 }}
              renderItem={({ item, index }) => (
                <UserRow
                  item={item}
                  index={index}
                  isSelf={item.id === user?.id}
                  onOpen={() => navigation.navigate('AdminUser', { id: item.id })}
                  onActivate={() => setActive(item, true)}
                  onDeactivate={() => setActive(item, false)}
                  onDelete={() => deleteUser(item)}
                />
              )}
            />
          )}
        </>
      )}

      <View style={{ height: 14 }} />
      <Button title="Logout" onPress={signOut} variant="ghost" />
    </Screen>
  );
}

function StatsView({ loading, stats, onOpen }) {
  if (loading) {
    return (
      <View>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <Skeleton height={70} radius={16} style={{ flex: 1 }} />
          <Skeleton height={70} radius={16} style={{ flex: 1 }} />
          <Skeleton height={70} radius={16} style={{ flex: 1 }} />
        </View>
        <Skeleton height={120} radius={18} />
      </View>
    );
  }
  if (!stats) {
    return (
      <Card>
        <EmptyState icon="·" title="No stats yet" />
      </Card>
    );
  }
  const u = stats.users || {};
  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatTile label="USERS" value={u.total || 0} delay={40} />
        <StatTile label="SHOPS" value={u.shops || 0} delay={100} />
        <StatTile label="CLIENTS" value={u.clients || 0} delay={160} />
      </View>
      <View style={{ height: 10 }} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatTile label="ADMINS" value={u.admins || 0} delay={40} />
        <StatTile label="DISABLED" value={u.disabled || 0} delay={100} highlight={u.disabled > 0} />
        <StatTile label="CARDS" value={stats.cards || 0} delay={160} />
      </View>
      <View style={{ height: 10 }} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatTile label="TX" value={stats.transactions || 0} delay={40} />
        <StatTile label="POINTS LIVE" value={stats.pointsOutstanding || 0} delay={100} />
        <StatTile label="·" value="—" delay={160} />
      </View>

      <View style={{ height: 16 }} />
      <Text style={{ fontWeight: '900', color: theme.text, fontSize: 16, marginBottom: 8 }}>Recent users</Text>
      {(stats.recentUsers || []).map((u2, i) => (
        <UserRow
          key={u2.id}
          item={u2}
          index={i}
          isSelf={false}
          onOpen={() => onOpen(u2)}
          compact
        />
      ))}
    </View>
  );
}

function StatTile({ label, value, delay = 0, highlight }) {
  return (
    <Card style={{ flex: 1, padding: 14 }} delay={delay}>
      <Text style={{ color: theme.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>{label}</Text>
      <Text style={{ marginTop: 4, fontSize: 22, fontWeight: '900', color: highlight ? theme.danger : theme.text }}>
        {value}
      </Text>
    </Card>
  );
}

function UserRow({ item, index, isSelf, onOpen, onActivate, onDeactivate, onDelete, compact }) {
  const name =
    item.role === 'shop' ? item.shopName || item.email : item.role === 'admin' ? item.email : item.displayName || item.email;
  const subtitle = useMemo(() => {
    const bits = [];
    if (item.role === 'shop') {
      bits.push(item.loyaltyType === 'stamps' ? `Stamps · ${item.stampGoal || 10}` : `Points · ${item.redeemThreshold || 100}`);
      if (item.address) bits.push(item.address);
    } else if (item.role === 'client') {
      if (item.phone) bits.push(item.phone);
    } else {
      bits.push('Administrator');
    }
    return bits.join(' · ');
  }, [item]);

  return (
    <Card style={{ marginBottom: 10, padding: 14 }} delay={index * 40}>
      <Pressable onPress={onOpen} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar name={name} color={item.role === 'shop' ? theme.ink : item.role === 'admin' ? theme.danger : theme.brand} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={{ fontWeight: '900', color: theme.text, fontSize: 15 }} numberOfLines={1}>
              {name}
            </Text>
            {item.isActive === false ? <Pill tone="danger">DISABLED</Pill> : null}
            {isSelf ? <Pill>YOU</Pill> : null}
          </View>
          <Text style={{ color: theme.muted, marginTop: 2, fontSize: 12.5 }} numberOfLines={1}>
            {item.email}
          </Text>
          {subtitle ? (
            <Text style={{ color: theme.subtle, marginTop: 1, fontSize: 11.5 }} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Text style={{ fontSize: 22, color: theme.subtle, fontWeight: '900', marginLeft: 6 }}>›</Text>
      </Pressable>
      {compact ? null : (
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
          {item.isActive === false ? (
            <View style={{ flex: 1 }}>
              <Button title="Activate" onPress={onActivate} size="sm" />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Button title="Disable" onPress={onDeactivate} size="sm" variant="secondary" disabled={isSelf} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Button title="Delete" onPress={onDelete} size="sm" variant="danger" disabled={isSelf} />
          </View>
        </View>
      )}
    </Card>
  );
}
