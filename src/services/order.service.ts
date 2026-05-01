import { prisma } from '../config/database.js';
import { StoreRepository } from '../repositories/store.repository.js';
import { ProductRepository } from '../repositories/product.repository.js';
import { AppError } from '../utils/app-error.js';

interface OrderItemInput {
  productId: string;
  quantity: number;
}

export class OrderService {
  constructor(
    private readonly stores: StoreRepository = new StoreRepository(),
    private readonly products: ProductRepository = new ProductRepository(),
  ) {}

  async create(
    userId: string,
    items: OrderItemInput[],
  ) {
    const store = await this.stores.findByUserId(userId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');

    let total = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = await this.products.findOne(store.id, item.productId);
      if (!product) {
        throw new AppError(404, `Produto "${item.productId}" não encontrado`, 'PRODUCT_NOT_FOUND');
      }
      if (!product.available) {
        throw new AppError(400, `Produto "${product.name}" não está disponível`, 'PRODUCT_UNAVAILABLE');
      }
      const price = Number(product.price);
      const subtotal = price * item.quantity;
      total += subtotal;
      orderItems.push({
        product: product.name,
        price: price.toString(), // Convert to string for Decimal
        quantity: item.quantity,
      });
    }

    const order = await prisma.order.create({
      data: {
        storeId: store.id,
        total: total.toString(), // Convert to string for Decimal
        items: { create: orderItems },
      },
      include: { items: true },
    });

    const whatsappLink = this.generateWhatsappLink(store, order);

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { whatsappLink },
      include: { items: true },
    });

    return updated;
  }

  async listByUser(userId: string) {
    const store = await this.stores.findByUserId(userId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    return prisma.order.findMany({
      where: { storeId: store.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private generateWhatsappLink(
    store: { phoneWhatsapp?: string | null; whatsappNumber?: string | null; name: string },
    order: { id: string; total: unknown; items: { product: string; price: unknown; quantity: number }[] },
  ): string {
    const whatsapp = store.phoneWhatsapp ?? store.whatsappNumber;
    if (!whatsapp) {
      throw new AppError(400, 'Configure o WhatsApp da loja antes de gerar pedidos', 'WHATSAPP_NOT_SET');
    }

    const phone = whatsapp.replace(/\D/g, '');
    const itemsText = order.items
      .map((i) => `• ${i.product} | Qtd: ${i.quantity} | R$ ${(Number(i.price) * i.quantity).toFixed(2)}`)
      .join('\n');

    const message =
`🛒 *Novo Pedido - ${store.name}*

${itemsText}

💰 *Total: R$ ${Number(order.total).toFixed(2)}*
🔗 Pedido: ${order.id}`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
}
