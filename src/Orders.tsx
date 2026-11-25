import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { basketLines, basketTotal, canChangeOrder, type Action, type Order, type Store } from './store';
import { dateLabel, type Translate } from './strings';
import { Button, colors, Empty, Icon, IconButton, Panel, ProductImage, styles as s } from './ui';

export type StoreProps = { state: Store; t: Translate; money: (amount: number) => string };
export type Dispatch = (action: Action) => boolean;

export function Cart({ state, t, money, dispatch, checkout, catalog, showProduct }: StoreProps & {
  dispatch: Dispatch; checkout: () => void; catalog: () => void; showProduct: (id: number) => void;
}) {
  const lines = basketLines(state);
  if (!lines.length) {
    return <Empty icon="bag-outline" title={t('emptyCart')}><Button label={t('openCatalog')} onPress={catalog} /></Empty>;
  }
  return (
    <>
      <Text style={s.title}>{t('cart')}</Text>
      {lines.map(line => {
        const product = state.products.find(item => item.id === line.productId)!;
        const quantity = (next: number) => dispatch({ kind: 'quantity', id: line.productId, quantity: next });
        return (
          <Panel key={line.productId}>
            <Pressable accessibilityRole="button" onPress={() => showProduct(line.productId)} style={s.row}>
              <View style={[s.imageFrame, orderStyles.thumbnail]}>
                <ProductImage image={product.image} name={product.name} size={61} />
              </View>
              <View style={[s.grow, s.stack]}>
                <Text style={s.strong}>{line.name}</Text>
                <Text style={s.muted}>{money(line.unitPrice)}</Text>
              </View>
            </Pressable>
            {line.quantity > product.stock && <Text style={s.muted}>{t('stock')}</Text>}
            <View style={s.spread}>
              <View style={s.row}>
                <IconButton label={line.quantity === 1 ? t('remove') : t('less')} icon={line.quantity === 1 ? 'trash-outline' : 'remove'}
                  onPress={() => quantity(line.quantity - 1)} />
                <Text style={s.strong}>{line.quantity}</Text>
                <IconButton label={t('more')} icon="add" disabled={line.quantity >= product.stock} onPress={() => quantity(line.quantity + 1)} />
              </View>
              <Text style={s.price}>{money(line.unitPrice * line.quantity)}</Text>
            </View>
          </Panel>
        );
      })}
      <Panel>
        <View style={s.spread}><Text style={s.section}>{t('subtotal')}</Text><Text style={s.price}>{money(basketTotal(lines))}</Text></View>
        <Button label={t('checkout')} icon="arrow-forward" onPress={checkout} />
        <Text style={s.muted}>{t('demoInfo')}</Text>
      </Panel>
    </>
  );
}

export function OrderList({ state, t, money, show, catalog, manage = false }: StoreProps & {
  show: (id: number) => void; catalog: () => void; manage?: boolean;
}) {
  const revenue = state.orders.reduce((total, order) => total + (order.status === 'completed' && order.payment === 'paid' ? order.total : 0), 0);
  return (
    <>
      <Text style={s.title}>{t(manage ? 'manageOrders' : 'orders')}</Text>
      {manage && <Panel><Text style={s.muted}>{t('revenue')}</Text><Text style={s.price}>{money(revenue)}</Text></Panel>}
      {!state.orders.length && (
        <Empty icon="receipt-outline" title={t('emptyOrders')}>
          {!manage && <Button label={t('openCatalog')} onPress={catalog} />}
        </Empty>
      )}
      {state.orders.map(order => (
        <Pressable accessibilityRole="button" key={order.id} onPress={() => show(order.id)}>
          <Panel>
            <View style={s.spread}>
              <Text style={s.section}>{t('order')} #{order.id}</Text>
              <Text style={s.status}>{t(order.status)}</Text>
            </View>
            <Text style={s.muted}>{dateLabel(order.createdAt, state.language)}{manage && order.buyer ? ` · ${order.buyer}` : ''}</Text>
            <View style={s.spread}>
              <Text style={s.price}>{money(order.total)}</Text>
              <Icon name="chevron-forward" size={19} color={colors.muted} />
            </View>
          </Panel>
        </Pressable>
      ))}
    </>
  );
}

export function OrderDetails({ order, state, t, money, dispatch, manage }: StoreProps & {
  order: Order; dispatch: Dispatch; manage: boolean;
}) {
  const nextLabel = order.status === 'new' ? 'confirmOrder'
    : order.status === 'confirmed' ? 'shipOrder'
    : order.status === 'shipped' ? 'completeOrder' : null;

  function confirmCancel() {
    Alert.alert(t('cancelOrder'), t('cancelPrompt'), [
      { text: t('back'), style: 'cancel' },
      { text: t('confirmCancel'), style: 'destructive', onPress: () => dispatch({ kind: 'cancel', id: order.id }) },
    ]);
  }

  return (
    <>
      <View style={s.stack}>
        <Text style={s.title}>{t('order')} #{order.id}</Text>
        <Text style={s.muted}>{dateLabel(order.createdAt, state.language)}</Text>
        <View style={s.wrap}>
          <Text style={s.status}>{t(order.status)}</Text>
          <Text style={s.status}>{t(order.payment)}</Text>
        </View>
      </View>
      <Panel>
        {manage && !!order.buyer && <Text style={s.muted}>{order.buyer}</Text>}
        {order.lines.map(line => (
          <View key={line.productId} style={s.spread}>
            <View style={s.grow}>
              <Text style={s.strong}>{line.name}</Text>
              <Text style={s.muted}>{line.quantity} × {money(line.unitPrice)}</Text>
            </View>
            <Text style={s.strong}>{money(line.quantity * line.unitPrice)}</Text>
          </View>
        ))}
        <View style={[s.spread, orderStyles.total]}><Text style={s.strong}>{t('subtotal')}</Text><Text style={s.price}>{money(order.total)}</Text></View>
      </Panel>
      {!manage && canChangeOrder(order) && order.payment === 'unpaid' && (
        <Panel>
          <Button label={t('demoPay')} icon="card-outline" onPress={() => dispatch({ kind: 'pay', id: order.id })} />
          <Text style={s.muted}>{t('demoInfo')}</Text>
        </Panel>
      )}
      {manage && nextLabel && <Button label={t(nextLabel)} onPress={() => dispatch({ kind: 'advance', id: order.id })} />}
      {canChangeOrder(order) && <Button label={t('cancelOrder')} variant="danger" onPress={confirmCancel} />}
    </>
  );
}

const orderStyles = StyleSheet.create({
  thumbnail: { width: 65, height: 65, borderRadius: 12 },
  total: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12 },
});
