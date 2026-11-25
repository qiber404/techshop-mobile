import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { categories, salePrice, type Category, type Language, type Product } from './store';
import { parsePrice } from './Catalog';
import type { Dispatch, StoreProps } from './Orders';
import type { Translate } from './strings';
import { Button, Chip, colors, Icon, Panel, ProductImage, styles as s, TextField } from './ui';

const localeOptions: [Language, string][] = [['ru', 'Русский'], ['kk', 'Қазақша'], ['en', 'English']];

export function Profile({ state, t, dispatch, products, orders }: Pick<StoreProps, 'state' | 't'> & {
  dispatch: Dispatch; products: () => void; orders: () => void;
}) {
  const [buyer, setBuyer] = useState(state.buyer);
  const [saved, setSaved] = useState(false);
  return (
    <>
      <Text style={s.title}>{t('profile')}</Text>
      <Panel>
        <TextField label={t('name')} placeholder={t('buyer')} value={buyer} maxLength={60}
          autoCapitalize="words" onChangeText={value => { setBuyer(value); setSaved(false); }} />
        <Button label={saved ? t('saved') : t('save')} icon={saved ? 'checkmark' : undefined}
          onPress={() => setSaved(dispatch({ kind: 'profile', buyer }))} />
      </Panel>
      <Panel>
        <Text style={s.section}>{t('language')}</Text>
        <View style={s.wrap}>
          {localeOptions.map(([language, name]) => <Chip key={language} label={name}
            active={state.language === language} onPress={() => dispatch({ kind: 'language', language })} />)}
        </View>
      </Panel>
      <Panel>
        <Text style={s.section}>{t('manage')}</Text>
        <Text style={s.muted}>{t('manageHint')}</Text>
        <Button label={t('manageProducts')} icon="cube-outline" variant="light" onPress={products} />
        <Button label={t('manageOrders')} icon="receipt-outline" variant="light" onPress={orders} />
      </Panel>
    </>
  );
}

export function Inventory({ state, t, money, edit }: StoreProps & { edit: (id?: number) => void }) {
  return (
    <>
      <Text style={s.title}>{t('manageProducts')}</Text>
      <Button label={t('addProduct')} icon="add" onPress={() => edit()} />
      {state.products.map(product => (
        <Pressable accessibilityRole="button" key={product.id} onPress={() => edit(product.id)}>
          <Panel>
            <View style={s.row}>
              <ProductImage name={product.name} image={product.image} size={54} />
              <View style={s.grow}>
                <Text style={s.strong}>{product.name}</Text>
                <Text style={s.muted}>{money(salePrice(product))} · {product.stock} {t('units')}</Text>
                {!product.active && <Text style={s.muted}>{t('hidden')}</Text>}
              </View>
              <Icon name="chevron-forward" size={18} color={colors.muted} />
            </View>
          </Panel>
        </Pressable>
      ))}
    </>
  );
}

export function EditProduct({ product, t, dispatch, done }: {
  product?: Product; t: Translate; dispatch: Dispatch; done: () => void;
}) {
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [category, setCategory] = useState<Category>(product?.category ?? categories[0]);
  const [price, setPrice] = useState(product ? String(product.price / 100) : '');
  const [discount, setDiscount] = useState(String(product?.discount ?? 0));
  const [stock, setStock] = useState(product ? String(product.stock) : '');

  function save() {
    const number = (value: string) => /^\d+$/.test(value.trim()) ? Number(value) : NaN;
    if (dispatch({
      kind: 'saveProduct', id: product?.id, product: {
        category, name, description, price: parsePrice(price), discount: number(discount), stock: number(stock),
      },
    })) done();
  }

  return (
    <>
      <Text style={s.title}>{t(product ? 'editProduct' : 'addProduct')}</Text>
      <TextField label={t('productName')} value={name} onChangeText={setName} maxLength={120} />
      <TextField label={t('description')} value={description} onChangeText={setDescription} multiline maxLength={2000} />
      <View style={s.stack}>
        <Text style={s.fieldLabel}>{t('category')}</Text>
        <View style={s.wrap}>
          {categories.map(item => <Chip key={item} label={t(item)} active={category === item} onPress={() => setCategory(item)} />)}
        </View>
      </View>
      <TextField label={t('price')} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
      <TextField label={t('stockLabel')} value={stock} onChangeText={setStock} keyboardType="number-pad" />
      <TextField label={t('discount')} value={discount} onChangeText={setDiscount} keyboardType="number-pad" />
      <Button label={t('save')} icon="checkmark" onPress={save} />
      {product && <Button label={t(product.active ? 'hide' : 'show')} variant={product.active ? 'danger' : 'light'}
        onPress={() => {
          if (dispatch({ kind: 'visibility', id: product.id })) done();
        }} />}
    </>
  );
}
