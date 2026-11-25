import type { Language } from './store';

const labels = {
  catalog: ['Каталог', 'Каталог', 'Catalog'],
  cart: ['Корзина', 'Себет', 'Cart'],
  orders: ['Заказы', 'Тапсырыстар', 'Orders'],
  profile: ['Профиль', 'Профиль', 'Profile'],
  featured: ['Товар со скидкой', 'Жеңілдіктегі тауар', 'Special offer'],
  search: ['Поиск по названию', 'Атауы бойынша іздеу', 'Search by name'],
  all: ['Все', 'Барлығы', 'All'],
  mice: ['Мыши', 'Тінтуірлер', 'Mice'],
  keyboards: ['Клавиатуры', 'Пернетақталар', 'Keyboards'],
  headphones: ['Наушники', 'Құлаққаптар', 'Headsets'],
  microphones: ['Микрофоны', 'Микрофондар', 'Microphones'],
  mousePads: ['Коврики', 'Төсеніштер', 'Mouse pads'],
  sortDefault: ['По умолчанию', 'Әдепкі', 'Default order'],
  sortLow: ['Сначала дешевле', 'Алдымен арзанырақ', 'Price low to high'],
  sortHigh: ['Сначала дороже', 'Алдымен қымбатырақ', 'Price high to low'],
  filters: ['Фильтры', 'Сүзгілер', 'Filters'],
  sort: ['Сортировка', 'Сұрыптау', 'Sort'],
  from: ['Цена от', 'Бағасы бастап', 'Min price'],
  to: ['Цена до', 'Бағасы дейін', 'Max price'],
  apply: ['Применить', 'Қолдану', 'Apply'],
  reset: ['Сбросить', 'Тазалау', 'Reset'],
  invalidRange: ['Укажите корректный диапазон цен.', 'Баға аралығын дұрыс енгізіңіз.', 'Enter a valid price range.'],
  nothing: ['Товары не найдены', 'Тауар табылмады', 'No products found'],
  add: ['В корзину', 'Себетке қосу', 'Add to cart'],
  soldOut: ['Нет в наличии', 'Қоймада жоқ', 'Out of stock'],
  inStock: ['В наличии', 'Қоймада бар', 'In stock'],
  product: ['Карточка товара', 'Тауар картасы', 'Product details'],
  units: ['шт.', 'дана', 'pcs'],
  reviews: ['Отзывы', 'Пікірлер', 'Reviews'],
  noReviews: ['Пока нет отзывов', 'Пікірлер әлі жоқ', 'No reviews yet'],
  leaveReview: ['Написать отзыв', 'Пікір жазу', 'Write a review'],
  reviewPlaceholder: ['Ваш отзыв о товаре', 'Тауар туралы пікіріңіз', 'Your review of this product'],
  publish: ['Опубликовать', 'Жариялау', 'Publish'],
  emptyCart: ['Корзина пуста', 'Себет бос', 'Your cart is empty'],
  emptyOrders: ['Заказов пока нет', 'Тапсырыстар әлі жоқ', 'No orders yet'],
  openCatalog: ['В каталог', 'Каталогқа өту', 'Browse catalog'],
  subtotal: ['Итого', 'Барлығы', 'Total'],
  checkout: ['Оформить заказ', 'Тапсырыс беру', 'Place order'],
  order: ['Заказ', 'Тапсырыс', 'Order'],
  remove: ['Убрать', 'Өшіру', 'Remove'],
  less: ['Уменьшить количество', 'Санын азайту', 'Decrease quantity'],
  more: ['Увеличить количество', 'Санын арттыру', 'Increase quantity'],
  demoPay: ['Оплатить тестово', 'Сынақ төлемі', 'Simulate payment'],
  demoInfo: ['Тестовая оплата. Деньги не списываются.', 'Сынақ төлемі. Ақша алынбайды.', 'Demo payment. No money is charged.'],
  cancelOrder: ['Отменить заказ', 'Тапсырыстан бас тарту', 'Cancel order'],
  cancelPrompt: ['Товары вернутся на склад.', 'Тауарлар қоймаға қайтарылады.', 'Items will be returned to stock.'],
  confirmCancel: ['Отменить', 'Бас тарту', 'Cancel order'],
  back: ['Назад', 'Артқа', 'Back'],
  ok: ['Понятно', 'Түсінікті', 'OK'],
  new: ['Новый', 'Жаңа', 'New'],
  confirmed: ['Подтверждён', 'Расталды', 'Confirmed'],
  shipped: ['Отправлен', 'Жіберілді', 'Shipped'],
  completed: ['Завершён', 'Аяқталды', 'Completed'],
  cancelled: ['Отменён', 'Бас тартылды', 'Cancelled'],
  unpaid: ['Ожидает оплаты', 'Төлем күтілуде', 'Awaiting payment'],
  paid: ['Тестовая оплата принята', 'Сынақ төлемі қабылданды', 'Demo payment accepted'],
  refunded: ['Тестовый возврат', 'Сынақ қайтарымы', 'Demo refund'],
  buyer: ['Покупатель', 'Сатып алушы', 'Customer'],
  name: ['Имя покупателя', 'Сатып алушының аты', 'Customer name'],
  save: ['Сохранить', 'Сақтау', 'Save'],
  saved: ['Сохранено', 'Сақталды', 'Saved'],
  language: ['Язык приложения', 'Қолданба тілі', 'App language'],
  manage: ['Управление магазином', 'Дүкенді басқару', 'Manage shop'],
  manageProducts: ['Товары и остатки', 'Тауарлар мен қор', 'Products and inventory'],
  manageOrders: ['Статусы заказов', 'Тапсырыс күйлері', 'Order statuses'],
  manageHint: ['Режим администратора на этом устройстве.', 'Осы құрылғыдағы әкімші режимі.', 'Administrator mode on this device.'],
  addProduct: ['Добавить товар', 'Тауар қосу', 'Add product'],
  editProduct: ['Редактировать товар', 'Тауарды өңдеу', 'Edit product'],
  productName: ['Название товара', 'Тауар атауы', 'Product name'],
  description: ['Описание', 'Сипаттама', 'Description'],
  price: ['Цена, ₸', 'Бағасы, ₸', 'Price, ₸'],
  discount: ['Скидка, %', 'Жеңілдік, %', 'Discount, %'],
  stockLabel: ['Остаток, шт.', 'Қалдық, дана', 'Stock, pcs'],
  category: ['Категория', 'Санат', 'Category'],
  hide: ['Скрыть из каталога', 'Каталогтан жасыру', 'Hide from catalog'],
  show: ['Вернуть в каталог', 'Каталогқа қайтару', 'Restore to catalog'],
  hidden: ['Скрыт', 'Жасырылған', 'Hidden'],
  revenue: ['Демо-выручка', 'Сынақ кірісі', 'Demo revenue'],
  confirmOrder: ['Подтвердить заказ', 'Тапсырысты растау', 'Confirm order'],
  shipOrder: ['Отметить отправленным', 'Жіберілді деп белгілеу', 'Mark as shipped'],
  completeOrder: ['Завершить заказ', 'Тапсырысты аяқтау', 'Complete order'],
  unavailable: ['Товар недоступен.', 'Тауар қолжетімсіз.', 'Product unavailable.'],
  stock: ['На складе недостаточно товара. Измените количество в корзине.', 'Қоймада тауар жеткіліксіз. Себеттегі санын өзгертіңіз.', 'Insufficient stock. Adjust quantities in the cart.'],
  orderMissing: ['Заказ не найден.', 'Тапсырыс табылмады.', 'Order not found.'],
  orderClosed: ['Для этого заказа действие недоступно.', 'Бұл тапсырыс үшін әрекет қолжетімсіз.', 'This action is unavailable for this order.'],
  paymentRequired: ['Сначала проведите тестовую оплату в заказе покупателя.', 'Алдымен сатып алушы тапсырысында сынақ төлемін жасаңыз.', 'Simulate payment in the customer order first.'],
  invalidReview: ['Поставьте оценку и напишите отзыв.', 'Баға қойып, пікір жазыңыз.', 'Choose a rating and write a review.'],
  invalidProduct: ['Проверьте название, цену, скидку и остаток.', 'Атауын, бағасын, жеңілдігін және қалдығын тексеріңіз.', 'Check the name, price, discount and stock.'],
  productExists: ['Товар с таким названием уже есть.', 'Осы атаудағы тауар бар.', 'A product with this name already exists.'],
  invalidName: ['Укажите имя покупателя.', 'Сатып алушының атын енгізіңіз.', 'Enter a customer name.'],
  error: ['Не удалось выполнить действие', 'Әрекет орындалмады', 'Unable to complete action'],
  storageError: ['Не удалось открыть или сохранить данные на устройстве.', 'Құрылғыдағы деректерді ашу немесе сақтау мүмкін болмады.', 'Unable to open or save data on this device.'],
  retry: ['Повторить', 'Қайталау', 'Retry'],
  rating: ['Оценка', 'Баға', 'Rating'],
  close: ['Закрыть', 'Жабу', 'Close'],
} as const;

export type Label = keyof typeof labels;
export type Translate = (label: Label) => string;
const languageIndex = { ru: 0, kk: 1, en: 2 } as const;
const locales = { ru: 'ru-KZ', kk: 'kk-KZ', en: 'en-KZ' };

export function translator(language: Language): Translate {
  return key => labels[key][languageIndex[language]];
}

export function priceFormatter(language: Language) {
  const fractional = new Intl.NumberFormat(locales[language], { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const integer = new Intl.NumberFormat(locales[language], { maximumFractionDigits: 0 });
  return (amount: number) => (amount % 100 ? fractional : integer).format(amount / 100) + ' ₸';
}

export function dateLabel(date: string, language: Language) {
  return new Intl.DateTimeFormat(locales[language], { dateStyle: 'medium' }).format(new Date(date));
}
