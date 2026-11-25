import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categories, salePrice, type Category, type Language, type Product, type Store } from './store';
import { dateLabel, type Translate } from './strings';
import { Button, Chip, colors, Empty, Icon, IconButton, Panel, ProductImage, styles as s, TextField } from './ui';

type CatalogProps = {
  state: Store; t: Translate; money: (amount: number) => string;
  show: (id: number) => void; add: (id: number) => void;
};
type Sort = 'sortDefault' | 'sortLow' | 'sortHigh';
const sorts: Sort[] = ['sortDefault', 'sortLow', 'sortHigh'];
type Filters = { min: string; max: string; sort: Sort };
const defaultFilters: Filters = { min: '', max: '', sort: 'sortDefault' };

export function parsePrice(text: string) {
  const normalized = text.trim().replace(',', '.');
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return NaN;
  return Math.round(Number(normalized) * 100);
}

export function Catalog({ state, t, money, show, add }: CatalogProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [filters, setFilters] = useState(defaultFilters);
  const [draft, setDraft] = useState(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const { width } = useWindowDimensions();
  const columns = width >= 630 ? 3 : 2;
  const tileWidth = (Math.min(width, 640) - 38 - (columns - 1) * 11) / columns;
  const imageSize = Math.min(tileWidth - 28, 139);
  const min = filters.min.trim() ? parsePrice(filters.min) : 0;
  const max = filters.max.trim() ? parsePrice(filters.max) : Infinity;
  const q = query.trim().toLowerCase();
  const products = state.products.filter(p => p.active && (category === 'all' || category === p.category)
    && p.name.toLowerCase().includes(q) && salePrice(p) >= min && salePrice(p) <= max);
  if (filters.sort !== 'sortDefault') {
    const sign = filters.sort === 'sortLow' ? 1 : -1;
    products.sort((left, right) => sign * (salePrice(left) - salePrice(right)));
  }
  const featured = !q && category === 'all' && filters === defaultFilters
    ? products.find(p => p.id === 10 && p.discount > 0 && p.stock > 0) ?? products.find(p => p.discount > 0 && p.stock > 0)
    : undefined;

  function acceptFilters() {
    const low = draft.min.trim() ? parsePrice(draft.min) : 0;
    const high = draft.max.trim() ? parsePrice(draft.max) : Infinity;
    if (!Number.isSafeInteger(low) || (high !== Infinity && !Number.isSafeInteger(high)) || high < low) {
      setInvalid(true);
      return;
    }
    setFilters(!draft.min.trim() && !draft.max.trim() && draft.sort === 'sortDefault' ? defaultFilters : draft);
    setFilterOpen(false);
  }

  return (
    <>
      <View style={s.row}>
        <View style={catalogStyles.search}>
          <Icon name="search-outline" size={19} color={colors.muted} />
          <TextInput accessibilityLabel={t('search')} placeholder={t('search')} placeholderTextColor={colors.muted}
            value={query} onChangeText={setQuery} autoCorrect={false} clearButtonMode="while-editing" style={catalogStyles.searchInput} />
        </View>
        <IconButton label={t('filters')} icon="options-outline" filled={filters !== defaultFilters}
          onPress={() => { setDraft(filters); setInvalid(false); setFilterOpen(true); }} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        contentContainerStyle={catalogStyles.chips}>
        {(['all', ...categories] as const).map(item => <Chip key={item} label={t(item)} active={category === item} onPress={() => setCategory(item)} />)}
      </ScrollView>
      {featured && (
        <Pressable accessibilityRole="button" accessibilityLabel={featured.name} onPress={() => show(featured.id)} style={catalogStyles.hero}>
          <View style={catalogStyles.heroCopy}>
            <Text style={catalogStyles.heroLabel}>{t('featured')}</Text>
            <Text style={catalogStyles.heroTitle}>{featured.name}</Text>
            <View style={s.wrap}>
              <Text style={catalogStyles.heroPrice}>{money(salePrice(featured))}</Text>
              <Text style={catalogStyles.heroSale}>−{featured.discount}%</Text>
            </View>
          </View>
          <View style={[s.imageFrame, catalogStyles.heroImage]}>
            <ProductImage image={featured.image} name={featured.name} size={99} />
          </View>
        </Pressable>
      )}
      <View style={s.spread}>
        <Text style={s.section}>{t('catalog')}</Text>
        <Text style={s.muted}>{products.length}</Text>
      </View>
      {!products.length && <Empty icon="search-outline" title={t('nothing')} />}
      <View style={catalogStyles.grid}>
        {products.map(product => (
          <View key={product.id} style={[catalogStyles.tile, { width: tileWidth }]}>
            <Pressable style={s.grow} accessibilityRole="button" accessibilityLabel={product.name} onPress={() => show(product.id)}>
              <View style={[s.imageFrame, catalogStyles.tileImage, { height: imageSize + 12 }]}>
                <ProductImage image={product.image} name={product.name} size={imageSize} />
                {!!product.discount && <Text style={[s.sale, catalogStyles.tileSale]}>−{product.discount}%</Text>}
              </View>
              <View style={catalogStyles.tileLabel}>
                <Text style={s.muted} numberOfLines={1}>{t(product.category)}</Text>
                <Text style={s.strong} numberOfLines={2}>{product.name}</Text>
              </View>
            </Pressable>
            <View style={catalogStyles.tileFooter}>
              <View style={s.grow}>
                {!!product.discount && <Text style={s.oldPrice}>{money(product.price)}</Text>}
                <Text style={s.price} adjustsFontSizeToFit numberOfLines={1}>{money(salePrice(product))}</Text>
                {!product.stock && <Text style={s.muted} numberOfLines={1}>{t('soldOut')}</Text>}
              </View>
              {!!product.stock && <IconButton label={t('add') + ' · ' + product.name} icon={state.cart[product.id] ? 'bag-check-outline' : 'add'} filled
                disabled={(state.cart[product.id] ?? 0) >= product.stock} onPress={() => add(product.id)} />}
            </View>
          </View>
        ))}
      </View>
      <Modal visible={filterOpen} onRequestClose={() => setFilterOpen(false)} presentationStyle="pageSheet" animationType="slide">
        <SafeAreaView style={s.safe}>
          <View style={s.header}>
            <Text style={s.headerLabel}>{t('filters')}</Text>
            <IconButton label={t('close')} icon="close" onPress={() => setFilterOpen(false)} />
          </View>
          <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
            <TextField label={t('from')} value={draft.min} onChangeText={min => setDraft({ ...draft, min })} keyboardType="decimal-pad" />
            <TextField label={t('to')} value={draft.max} onChangeText={max => setDraft({ ...draft, max })} keyboardType="decimal-pad" />
            {invalid && <Text accessibilityRole="alert" style={s.body}>{t('invalidRange')}</Text>}
            <Text style={s.section}>{t('sort')}</Text>
            <View style={s.wrap}>
              {sorts.map(sort => <Chip key={sort} label={t(sort)} active={sort === draft.sort} onPress={() => setDraft({ ...draft, sort })} />)}
            </View>
            <Button label={t('apply')} onPress={acceptFilters} />
            <Button label={t('reset')} variant="light" onPress={() => { setDraft(defaultFilters); setFilters(defaultFilters); setFilterOpen(false); }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

export function ProductDetails({ product, state, t, money, add, submit }: {
  product: Product; state: Store; t: Translate; money: (amount: number) => string;
  add: () => void; submit: (rating: number, comment: string) => boolean;
}) {
  const { width } = useWindowDimensions();
  const [write, setWrite] = useState(false);
  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');
  const reviews = state.reviews.filter(review => review.productId === product.id);
  const score = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const translatedDescription: Partial<Record<Language, string>> = {
    kk: product.descriptionKk,
    en: product.descriptionEn,
  };
  const quantity = state.cart[product.id] ?? 0;
  return (
    <>
      <View style={[s.imageFrame, catalogStyles.detailImage]}>
        <ProductImage image={product.image} name={product.name} size={Math.min(width - 70, 320)} />
      </View>
      <View style={s.stack}>
        <Text style={s.muted}>{t(product.category)}</Text>
        <Text style={s.title}>{product.name}</Text>
        <View style={s.wrap}>
          <Text style={s.price}>{money(salePrice(product))}</Text>
          {!!product.discount && <Text style={s.oldPrice}>{money(product.price)}</Text>}
          {!!product.discount && <Text style={s.sale}>−{product.discount}%</Text>}
        </View>
        <Text style={s.muted}>{product.stock ? `${t('inStock')} · ${product.stock} ${t('units')}` : t('soldOut')}</Text>
      </View>
      <Button label={quantity ? `${t('add')} · ${quantity}` : t('add')} icon="bag-add-outline"
        disabled={!product.active || quantity >= product.stock} onPress={add} />
      <Text style={s.body}>{translatedDescription[state.language] || product.description}</Text>
      <View style={s.spread}>
        <Text style={s.section}>{t('reviews')}</Text>
        {!!reviews.length && <Text style={s.strong}>★ {score.toFixed(1)} · {reviews.length}</Text>}
      </View>
      {!reviews.length && <Text style={s.muted}>{t('noReviews')}</Text>}
      {write ? (
        <Panel>
          <View style={s.wrap}>
            {[1, 2, 3, 4, 5].map(rating => <IconButton key={rating} label={`${t('rating')} ${rating}`}
              icon={rating <= stars ? 'star' : 'star-outline'} filled={rating <= stars} onPress={() => setStars(rating)} />)}
          </View>
          <TextField label={t('reviewPlaceholder')} multiline maxLength={2000} value={text} onChangeText={setText} />
          <Button label={t('publish')} onPress={() => {
            if (submit(stars, text)) { setWrite(false); setText(''); setStars(5); }
          }} />
        </Panel>
      ) : <Button label={t('leaveReview')} icon="chatbox-outline" variant="light" onPress={() => setWrite(true)} />}
      {reviews.map(review => (
        <Panel key={review.id}>
          <View style={s.spread}><Text style={[s.strong, s.grow]}>{review.author || t('buyer')}</Text><Text style={s.strong}>★ {review.rating}</Text></View>
          <Text style={s.body}>{review.comment}</Text>
          <Text style={s.muted}>{dateLabel(review.createdAt, state.language)}</Text>
        </Panel>
      ))}
    </>
  );
}

const catalogStyles = StyleSheet.create({
  search: {
    flex: 1, minHeight: 47, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1,
    borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 9,
  },
  searchInput: { flex: 1, minHeight: 44, fontSize: 16, color: colors.ink },
  chips: { gap: 8 },
  hero: {
    minHeight: 158, backgroundColor: colors.deep, borderRadius: 23, padding: 15,
    alignItems: 'center', flexDirection: 'row', gap: 12,
  },
  heroCopy: { flex: 1, gap: 8 },
  heroLabel: { color: colors.lime, fontSize: 13, fontWeight: '700' },
  heroTitle: { color: colors.white, fontSize: 25, lineHeight: 28, fontWeight: '800', letterSpacing: -0.55 },
  heroPrice: { color: colors.white, fontSize: 16, fontWeight: '800' },
  heroSale: { color: colors.deep, backgroundColor: colors.lime, overflow: 'hidden', borderRadius: 7, padding: 4, fontSize: 12, fontWeight: '800' },
  heroImage: { width: 104, height: 114, borderRadius: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  tile: { minHeight: 224, padding: 7, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 17 },
  tileImage: { borderRadius: 12 },
  tileSale: { position: 'absolute', top: 4, left: 3 },
  tileLabel: { paddingHorizontal: 4, paddingTop: 3, gap: 3, minHeight: 63 },
  tileFooter: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, paddingLeft: 4, paddingTop: 8 },
  detailImage: { borderRadius: 22, borderColor: colors.line, borderWidth: 1, paddingVertical: 13 },
});
