import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator, Alert, BackHandler, Keyboard, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { translator, priceFormatter } from './strings';
import { type Action, type Store, updateStore } from './store';
import { loadStore, saveStore } from './storage';
import { Button, colors, Icon, IconButton, type IconName, styles as s } from './ui';
import { Catalog, ProductDetails } from './Catalog';
import { Cart, OrderDetails, OrderList } from './Orders';
import { EditProduct, Inventory, Profile } from './ShopManagement';

type Tab = 'catalog' | 'cart' | 'orders' | 'profile';
type Route =
  | { page: 'product'; id: number }
  | { page: 'order'; id: number; manage: boolean }
  | { page: 'manageProducts' | 'manageOrders' }
  | { page: 'editProduct'; id?: number };

const tabs: { key: Tab; icon: IconName; selectedIcon: IconName }[] = [
  { key: 'catalog', icon: 'grid-outline', selectedIcon: 'grid' },
  { key: 'cart', icon: 'bag-outline', selectedIcon: 'bag' },
  { key: 'orders', icon: 'receipt-outline', selectedIcon: 'receipt' },
  { key: 'profile', icon: 'person-outline', selectedIcon: 'person' },
];

function Shop({ initial }: { initial: Store }) {
  const [state, setState] = useState(initial);
  const latest = useRef(initial);
  const [tab, setTab] = useState<Tab>('catalog');
  const [routes, setRoutes] = useState<Route[]>([]);
  const t = translator(state.language);
  const money = priceFormatter(state.language);
  const active = routes.at(-1);
  const count = Object.values(state.cart).reduce((total, amount) => total + amount, 0);

  function back() {
    Keyboard.dismiss();
    setRoutes(current => current.slice(0, -1));
  }

  useEffect(() => {
    if (!active && tab === 'catalog') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (active) back();
      else setTab('catalog');
      return true;
    });
    return () => sub.remove();
  }, [active, tab]);

  function root(next: Tab) {
    Keyboard.dismiss();
    setRoutes([]);
    setTab(next);
  }

  function open(route: Route) {
    Keyboard.dismiss();
    setRoutes(current => [...current, route]);
  }

  function dispatch(action: Action) {
    const result = updateStore(latest.current, action);
    if (!result.ok) {
      Alert.alert(t('error'), t(result.error), [{ text: t('ok') }]);
      return false;
    }
    try {
      saveStore(result.state);
    } catch {
      Alert.alert(t('error'), t('storageError'), [{ text: t('ok') }]);
      return false;
    }
    latest.current = result.state;
    setState(result.state);
    return true;
  }

  function add(id: number) {
    dispatch({ kind: 'quantity', id, quantity: (latest.current.cart[id] ?? 0) + 1 });
  }

  function checkout() {
    if (dispatch({ kind: 'checkout', now: new Date().toISOString() })) {
      const id = latest.current.orders[0].id;
      root('orders');
      setRoutes([{ page: 'order', id, manage: false }]);
    }
  }

  const props = { state, t, money };
  const showProduct = (id: number) => open({ page: 'product', id });
  const showOrder = (id: number, manage: boolean) => open({ page: 'order', id, manage });
  const renderTab = () => {
    if (tab === 'cart') {
      return <Cart {...props} dispatch={dispatch} checkout={checkout} catalog={() => root('catalog')} showProduct={showProduct} />;
    }
    if (tab === 'orders') {
      return <OrderList {...props} show={id => showOrder(id, false)} catalog={() => root('catalog')} />;
    }
    if (tab === 'profile') {
      return <Profile {...props} dispatch={dispatch} products={() => open({ page: 'manageProducts' })} orders={() => open({ page: 'manageOrders' })} />;
    }
    return <Catalog {...props} add={add} show={showProduct} />;
  };
  let screen: ReactNode;
  if (active?.page === 'product') {
    const product = state.products.find(item => item.id === active.id);
    screen = product?.active ? <ProductDetails key={product.id} product={product} {...props}
      add={() => add(product.id)} submit={(rating, comment) =>
        dispatch({ kind: 'review', id: product.id, rating, comment, now: new Date().toISOString() })} />
      : <Text style={s.body}>{t('unavailable')}</Text>;
  } else if (active?.page === 'order') {
    const order = state.orders.find(item => item.id === active.id);
    screen = order ? <OrderDetails order={order} {...props} manage={active.manage} dispatch={dispatch} />
      : <Text style={s.body}>{t('orderMissing')}</Text>;
  } else if (active?.page === 'manageProducts') {
    screen = <Inventory {...props} edit={id => open({ page: 'editProduct', id })} />;
  } else if (active?.page === 'manageOrders') {
    screen = <OrderList {...props} manage show={id => showOrder(id, true)} catalog={() => root('catalog')} />;
  } else if (active?.page === 'editProduct') {
    screen = <EditProduct t={t} product={state.products.find(item => item.id === active.id)} dispatch={dispatch} done={back} />;
  }

  const headerLabel = active?.page === 'product' ? 'product'
    : active?.page === 'order' ? 'order'
    : active?.page === 'editProduct' ? (active.id ? 'editProduct' : 'addProduct')
    : active?.page;

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.header}>
          {active && <IconButton label={t('back')} icon="chevron-back" onPress={back} />}
          <Text style={headerLabel ? s.headerLabel : s.brand}>{headerLabel ? t(headerLabel) : 'TechShop'}</Text>
          {active?.page === 'product' && (
            <View>
              <IconButton label={t('cart')} icon="bag-outline" onPress={() => root('cart')} />
              {!!count && <Text style={appStyles.badge}>{count > 99 ? '99+' : count}</Text>}
            </View>
          )}
        </View>
        <ScrollView key={tab} style={active ? appStyles.hidden : s.grow} contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          {renderTab()}
        </ScrollView>
        {active && <ScrollView key={active.page} style={s.grow} contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          {screen}
        </ScrollView>}
        {!active && (
          <View style={appStyles.tabBar}>
            {tabs.map(item => (
              <Pressable key={item.key} accessibilityRole="tab" accessibilityLabel={t(item.key)}
                accessibilityState={{ selected: tab === item.key }} style={appStyles.tab} onPress={() => root(item.key)}>
                <View style={[appStyles.tabIcon, tab === item.key && appStyles.tabActive]}>
                  <Icon name={tab === item.key ? item.selectedIcon : item.icon} size={21} color={tab === item.key ? colors.leaf : colors.muted} />
                  {item.key === 'cart' && !!count && <Text style={appStyles.badge}>{count > 99 ? '99+' : count}</Text>}
                </View>
                <Text style={[appStyles.tabText, tab === item.key && appStyles.tabTextActive]}>{t(item.key)}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  const [state, setState] = useState<Store>();
  const [failed, setFailed] = useState(false);
  const t = translator('ru');

  function load() {
    setFailed(false);
    try {
      setState(loadStore());
    } catch {
      setFailed(true);
    }
  }

  useEffect(load, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {state ? <Shop initial={state} />
        : <SafeAreaView style={s.safe}><View style={[s.center, s.stack]}>
          {failed ? <>
            <Text accessibilityRole="alert" style={s.body}>{t('storageError')}</Text>
            <Button label={t('retry')} onPress={load} />
          </> : <ActivityIndicator color={colors.leaf} size="large" />}
        </View></SafeAreaView>}
    </SafeAreaProvider>
  );
}

const appStyles = StyleSheet.create({
  hidden: { display: 'none' },
  tabBar: {
    flexDirection: 'row', backgroundColor: colors.paper, paddingVertical: 6, paddingHorizontal: 7,
    borderTopColor: colors.line, borderTopWidth: 1,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 54, gap: 2 },
  tabIcon: { width: 48, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.lime },
  tabText: { color: colors.muted, fontSize: 11 },
  tabTextActive: { color: colors.ink, fontWeight: '800' },
  badge: {
    position: 'absolute', right: -3, top: -4, backgroundColor: colors.leaf, color: colors.white,
    fontSize: 10, fontWeight: '800', minWidth: 17, textAlign: 'center', borderRadius: 8,
    overflow: 'hidden', paddingHorizontal: 4, paddingVertical: 2,
  },
});
