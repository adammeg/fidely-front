import { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  Avatar,
  Button,
  Card,
  LoadingOverlay,
  Pill,
  Screen,
  Skeleton,
  theme,
} from '../ui/components';

export default function AdminUserScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { user: me } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users/${id}`);
      setData(res.data);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const u = data?.user;
  const counts = data?.counts;
  const isSelf = u && me && u.id === me.id;

  async function setActive(isActive) {
    setBusy(true);
    try {
      const path = isActive ? `/admin/users/${id}/activate` : `/admin/users/${id}/deactivate`;
      const res = await api.post(path);
      setData((prev) => ({ ...prev, user: res.data.user }));
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  function deleteUser() {
    Alert.alert(
      'Delete user',
      `Permanently delete "${u?.email}" and all their cards & history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await api.delete(`/admin/users/${id}`);
              navigation.goBack();
            } catch (e) {
              Alert.alert('Error', e?.response?.data?.message || 'Delete failed');
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  }

  return (
    <Screen title={u ? (u.shopName || u.displayName || u.email) : 'User'} subtitle="Inspect, manage, or remove the account.">
      {loading ? (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Skeleton width={56} height={56} radius={28} />
            <View style={{ flex: 1 }}>
              <Skeleton width="60%" height={16} />
              <View style={{ height: 6 }} />
              <Skeleton width="40%" height={12} />
            </View>
          </View>
          <View style={{ height: 16 }} />
          <Skeleton height={120} radius={14} />
        </Card>
      ) : !u ? (
        <Card>
          <Text style={{ color: theme.muted }}>User not found.</Text>
        </Card>
      ) : (
        <>
          <Card delay={40}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar name={u.shopName || u.displayName || u.email} size={56} color={u.role === 'shop' ? theme.ink : u.role === 'admin' ? theme.danger : theme.brand} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontWeight: '900', color: theme.text, fontSize: 18 }}>
                  {u.shopName || u.displayName || u.email}
                </Text>
                <Text style={{ color: theme.muted, fontSize: 13, marginTop: 2 }}>{u.email}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  <Pill tone={u.role === 'admin' ? 'danger' : 'default'}>{u.role.toUpperCase()}</Pill>
                  <Pill tone={u.isActive ? 'brand' : 'danger'}>{u.isActive ? 'ACTIVE' : 'DISABLED'}</Pill>
                  {isSelf ? <Pill>YOU</Pill> : null}
                </View>
              </View>
            </View>
          </Card>

          <Card delay={100}>
            <Text style={{ fontWeight: '900', color: theme.text, marginBottom: 8 }}>Profile</Text>
            <Row label="Email" value={u.email} onPress={() => Linking.openURL(`mailto:${u.email}`)} />
            {u.phone ? <Row label="Phone" value={u.phone} onPress={() => Linking.openURL(`tel:${u.phone}`)} /> : null}
            {u.role === 'shop' ? (
              <>
                <Row label="Owner" value={u.ownerName || '—'} />
                <Row label="Shop name" value={u.shopName || '—'} />
                <Row label="Address" value={u.address || '—'} />
                <Row
                  label="Loyalty"
                  value={
                    u.loyaltyType === 'stamps'
                      ? `Stamps · goal ${u.stampGoal || 10}`
                      : `Points · +${u.pointsPerPurchase || 10} / redeem ${u.redeemThreshold || 100}`
                  }
                />
                <Row label="Card color" value={u.cardColor || '—'} />
                {u.logoUrl ? <Row label="Logo URL" value={u.logoUrl} onPress={() => Linking.openURL(u.logoUrl)} /> : null}
              </>
            ) : null}
            {u.role === 'client' ? (
              <Row label="Display name" value={u.displayName || '—'} />
            ) : null}
            {u.location ? (
              <Row
                label="Last location"
                value={`${u.location.lat.toFixed(5)}, ${u.location.lng.toFixed(5)}`}
                onPress={() =>
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${u.location.lat},${u.location.lng}`)
                }
              />
            ) : null}
            <Row label="Created" value={new Date(u.createdAt).toLocaleString()} />
          </Card>

          <Card delay={160}>
            <Text style={{ fontWeight: '900', color: theme.text, marginBottom: 8 }}>Activity</Text>
            <Row
              label={u.role === 'shop' ? 'Cards issued' : u.role === 'client' ? 'Cards held' : 'Cards'}
              value={String(
                (counts?.cardsAsShop || 0) + (counts?.cardsAsClient || 0)
              )}
            />
            {u.role !== 'admin' ? (
              <>
                <Row label="As shop" value={String(counts?.cardsAsShop || 0)} />
                <Row label="As client" value={String(counts?.cardsAsClient || 0)} />
              </>
            ) : null}
          </Card>

          <Card delay={220}>
            <Text style={{ fontWeight: '900', color: theme.text, marginBottom: 10 }}>Danger zone</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                {u.isActive ? (
                  <Button title="Disable" onPress={() => setActive(false)} variant="secondary" disabled={isSelf || busy} />
                ) : (
                  <Button title="Activate" onPress={() => setActive(true)} disabled={busy} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Delete user" onPress={deleteUser} variant="danger" disabled={isSelf || busy} />
              </View>
            </View>
            {isSelf ? (
              <Text style={{ marginTop: 8, color: theme.muted, fontSize: 12 }}>
                You can't disable or delete your own admin account.
              </Text>
            ) : null}
          </Card>
        </>
      )}

      <View style={{ height: 12 }} />
      <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" />
      <LoadingOverlay visible={busy} label="Working…" />
    </Screen>
  );
}

function Row({ label, value, onPress }) {
  const inner = (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.border }}>
      <Text style={{ color: theme.muted, fontSize: 12.5, fontWeight: '700', flex: 0.4 }}>{label}</Text>
      <Text
        style={{ color: onPress ? theme.brand2 : theme.text, fontSize: 13.5, fontWeight: '700', textAlign: 'right', flex: 0.6 }}
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
  if (onPress) {
    return <Pressable onPress={onPress}>{inner}</Pressable>;
  }
  return inner;
}
