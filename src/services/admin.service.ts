import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/app-error.js';

const toDDMMYYYY = (date: Date): string =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const userRoleToTipo = (role: 'ADMIN' | 'LOJISTA' | 'CLIENTE'): 'Admin' | 'Lojista' | 'Cliente' =>
  role === 'ADMIN' ? 'Admin' : role === 'LOJISTA' ? 'Lojista' : 'Cliente';

const userStatusToLabel = (status: 'ATIVO' | 'INATIVO' | 'BLOQUEADO' | 'PENDENTE'): 'Ativo' | 'Inativo' | 'Bloqueado' | 'Pendente' =>
  status === 'ATIVO' ? 'Ativo' : status === 'INATIVO' ? 'Inativo' : status === 'BLOQUEADO' ? 'Bloqueado' : 'Pendente';

const storeStatusToLabel = (status: 'ATIVA' | 'INATIVA' | 'PENDENTE' | 'BLOQUEADA'): 'Ativa' | 'Inativa' | 'Pendente' | 'Bloqueada' =>
  status === 'ATIVA' ? 'Ativa' : status === 'INATIVA' ? 'Inativa' : status === 'PENDENTE' ? 'Pendente' : 'Bloqueada';

const orderStatusToLabel = (status: 'AGUARDANDO' | 'EM_ANDAMENTO' | 'ENTREGUE' | 'CANCELADO'): 'Aguardando' | 'Em andamento' | 'Entregue' | 'Cancelado' =>
  status === 'AGUARDANDO' ? 'Aguardando' : status === 'EM_ANDAMENTO' ? 'Em andamento' : status === 'ENTREGUE' ? 'Entregue' : 'Cancelado';

const productStatusToLabel = (status: 'ATIVO' | 'INATIVO'): 'Ativo' | 'Inativo' => (status === 'ATIVO' ? 'Ativo' : 'Inativo');

const catalogStatusToLabel = (status: 'PUBLICADO' | 'PAUSADO'): 'Publicado' | 'Pausado' =>
  status === 'PUBLICADO' ? 'Publicado' : 'Pausado';

const lastAccessLabel = (date: Date | null): string => {
  if (!date) return 'Nunca';
  const now = new Date();
  const diffMs = startOfDay(now).getTime() - startOfDay(date).getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  return `${days} dias atrás`;
};

export class AdminService {
  private async audit(input: {
    actorUserId: string;
    action: string;
    entityType: string;
    entityId: string;
    beforeData?: Prisma.InputJsonValue;
    afterData?: Prisma.InputJsonValue;
  }): Promise<void> {
    await prisma.auditLog.create({ data: input });
  }

  async getDashboard() {
    const [totalLojasAtivas, totalUsuarios, totalProdutos, receitaTotalAgg] = await Promise.all([
      prisma.store.count({ where: { status: 'ATIVA' } }),
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
    ]);

    const hoje = new Date();
    const inicioHoje = startOfDay(hoje);
    const fimHoje = endOfDay(hoje);
    const pedidosHoje = await prisma.order.count({ where: { createdAt: { gte: inicioHoje, lte: fimHoje } } });

    const [lojasMesAtual, lojasMesAnterior, usuariosMesAtual, usuariosMesAnterior, pedidosMesAtual, pedidosMesAnterior] = await Promise.all([
      prisma.store.count({ where: { createdAt: { gte: new Date(hoje.getFullYear(), hoje.getMonth(), 1) } } }),
      prisma.store.count({
        where: { createdAt: { gte: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1), lt: new Date(hoje.getFullYear(), hoje.getMonth(), 1) } },
      }),
      prisma.user.count({ where: { createdAt: { gte: new Date(hoje.getFullYear(), hoje.getMonth(), 1) } } }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1), lt: new Date(hoje.getFullYear(), hoje.getMonth(), 1) } },
      }),
      prisma.order.count({ where: { createdAt: { gte: new Date(hoje.getFullYear(), hoje.getMonth(), 1) } } }),
      prisma.order.count({
        where: { createdAt: { gte: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1), lt: new Date(hoje.getFullYear(), hoje.getMonth(), 1) } },
      }),
    ]);

    const receitaMesAtual = await prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: new Date(hoje.getFullYear(), hoje.getMonth(), 1) } },
    });
    const receitaMesAnterior = await prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1), lt: new Date(hoje.getFullYear(), hoje.getMonth(), 1) } },
    });

    const pedidos7DiasRaw = await prisma.order.groupBy({
      by: ['createdAt'],
      _count: { _all: true },
      where: { createdAt: { gte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) } },
      orderBy: { createdAt: 'asc' },
    });
    const weekdayPt = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const pedidos7Dias = pedidos7DiasRaw.map((p) => ({ dia: weekdayPt[p.createdAt.getDay()], total: p._count._all }));

    const top5LojasRaw = await prisma.order.groupBy({
      by: ['storeId'],
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    });
    const storeIds = top5LojasRaw.map((t) => t.storeId);
    const stores = storeIds.length ? await prisma.store.findMany({ where: { id: { in: storeIds } }, select: { id: true, name: true } }) : [];
    const top5Lojas = top5LojasRaw.map((t) => ({
      nome: stores.find((s) => s.id === t.storeId)?.name ?? 'Loja sem nome',
      receita: Number(t._sum.total ?? 0),
    }));

    const atividadeRecente = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { action: true, entityType: true, entityId: true, createdAt: true },
    });

    return {
      metricas: {
        total_lojas_ativas: totalLojasAtivas,
        total_usuarios: totalUsuarios,
        pedidos_hoje: pedidosHoje,
        receita_total: Number(receitaTotalAgg._sum.total ?? 0),
        total_produtos: totalProdutos,
        variacao_lojas: `${lojasMesAtual - lojasMesAnterior >= 0 ? '+' : ''}${lojasMesAtual - lojasMesAnterior} este mês`,
        variacao_usuarios: `${usuariosMesAtual - usuariosMesAnterior >= 0 ? '+' : ''}${usuariosMesAtual - usuariosMesAnterior} este mês`,
        variacao_pedidos: `${pedidosMesAtual - pedidosMesAnterior >= 0 ? '+' : ''}${pedidosMesAtual - pedidosMesAnterior} este mês`,
        variacao_receita: `${Number(receitaMesAtual._sum.total ?? 0) - Number(receitaMesAnterior._sum.total ?? 0) >= 0 ? '+' : ''}${(
          Number(receitaMesAtual._sum.total ?? 0) - Number(receitaMesAnterior._sum.total ?? 0)
        ).toFixed(2)} este mês`,
        variacao_produtos: '+0 este mês',
      },
      pedidos_7_dias: pedidos7Dias,
      top_5_lojas: top5Lojas,
      atividade_recente: atividadeRecente.map((a) => ({
        tipo: a.action,
        descricao: `${a.entityType} ${a.entityId}`,
        timestamp: a.createdAt.toISOString(),
      })),
    };
  }

  async listStores(params: { page: number; limit: number; status?: string; search?: string }) {
    const { page, limit, status, search } = params;
    const where: Prisma.StoreWhereInput = {
      ...(status ? { status: status.toUpperCase().replace('Á', 'A') as any } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
    const [total, stores] = await Promise.all([
      prisma.store.count({ where }),
      prisma.store.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: true, _count: { select: { products: true, orders: true } }, orders: { select: { total: true } } },
      }),
    ]);
    return {
      data: stores.map((s) => ({
        id: s.id,
        nome: s.name,
        dono: s.user.email,
        email_dono: s.user.email,
        status: storeStatusToLabel(s.status),
        total_produtos: s._count.products,
        total_pedidos: s._count.orders,
        receita_total: s.orders.reduce((acc, o) => acc + Number(o.total), 0),
        data_cadastro: toDDMMYYYY(s.createdAt),
      })),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async getStoreById(id: string) {
    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        user: true,
        products: { orderBy: { createdAt: 'desc' }, take: 5 },
        orders: { orderBy: { createdAt: 'desc' }, take: 5 },
        _count: { select: { products: true, orders: true } },
      },
    });
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    return {
      id: store.id,
      nome: store.name,
      dono: store.user.email,
      email_dono: store.user.email,
      status: storeStatusToLabel(store.status),
      total_produtos: store._count.products,
      total_pedidos: store._count.orders,
      receita_total: store.orders.reduce((acc, o) => acc + Number(o.total), 0),
      data_cadastro: toDDMMYYYY(store.createdAt),
      produtos_recentes: store.products.map((p) => ({
        id: p.id,
        nome: p.name,
        preco: Number(p.price),
        estoque: p.stock,
        status: productStatusToLabel(p.status),
      })),
      pedidos_recentes: store.orders.map((o) => ({
        id: `#${o.id.slice(0, 4).toUpperCase()}`,
        cliente: o.customerName,
        total: Number(o.total),
        status: orderStatusToLabel(o.status),
        data: toDDMMYYYY(o.createdAt),
      })),
    };
  }

  async updateStoreStatus(actorUserId: string, id: string, status: 'Ativa' | 'Inativa' | 'Bloqueada') {
    const before = await prisma.store.findUnique({ where: { id } });
    if (!before) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    const mapped = status === 'Ativa' ? 'ATIVA' : status === 'Inativa' ? 'INATIVA' : 'BLOQUEADA';
    const updated = await prisma.store.update({ where: { id }, data: { status: mapped } });
    await this.audit({
      actorUserId,
      action: 'PATCH_STORE_STATUS',
      entityType: 'store',
      entityId: id,
      beforeData: before as unknown as Prisma.InputJsonValue,
      afterData: updated as unknown as Prisma.InputJsonValue,
    });
    return { id: updated.id, status: storeStatusToLabel(updated.status) };
  }

  async listUsers(params: { page: number; limit: number; tipo?: string; status?: string; search?: string }) {
    const { page, limit, tipo, status, search } = params;
    const where: Prisma.UserWhereInput = {
      ...(tipo ? { role: tipo.toUpperCase().replace('ADMIN', 'ADMIN').replace('LOJISTA', 'LOJISTA').replace('CLIENTE', 'CLIENTE') as any } : {}),
      ...(status ? { status: status.toUpperCase().replace('Á', 'A') as any } : {}),
      ...(search ? { OR: [{ email: { contains: search, mode: 'insensitive' } }] } : {}),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id,
        nome: u.email.split('@')[0],
        email: u.email,
        tipo: userRoleToTipo(u.role),
        status: userStatusToLabel(u.status),
        data_cadastro: toDDMMYYYY(u.createdAt),
        ultimo_acesso: lastAccessLabel(u.lastLoginAt),
      })),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async updateUserStatus(actorUserId: string, id: string, status: 'Ativo' | 'Bloqueado' | 'Inativo') {
    const before = await prisma.user.findUnique({ where: { id } });
    if (!before) throw new AppError(404, 'Usuário não encontrado', 'USER_NOT_FOUND');
    const mapped = status === 'Ativo' ? 'ATIVO' : status === 'Bloqueado' ? 'BLOQUEADO' : 'INATIVO';
    const updated = await prisma.user.update({ where: { id }, data: { status: mapped } });
    await this.audit({
      actorUserId,
      action: 'PATCH_USER_STATUS',
      entityType: 'user',
      entityId: id,
      beforeData: before as unknown as Prisma.InputJsonValue,
      afterData: updated as unknown as Prisma.InputJsonValue,
    });
    return { id: updated.id, status: userStatusToLabel(updated.status) };
  }

  async listOrders(params: { page: number; limit: number; status?: string; search?: string; data_inicio?: string; data_fim?: string }) {
    const { page, limit, status, search, data_inicio, data_fim } = params;
    const where: Prisma.OrderWhereInput = {
      ...(status
        ? {
            status:
              status === 'Aguardando' ? 'AGUARDANDO' : status === 'Em andamento' ? 'EM_ANDAMENTO' : status === 'Entregue' ? 'ENTREGUE' : 'CANCELADO',
          }
        : {}),
      ...(search
        ? {
            OR: [
              { id: { contains: search, mode: 'insensitive' } },
              { customerName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(data_inicio || data_fim
        ? {
            createdAt: {
              ...(data_inicio ? { gte: startOfDay(new Date(data_inicio)) } : {}),
              ...(data_fim ? { lte: endOfDay(new Date(data_fim)) } : {}),
            },
          }
        : {}),
    };

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { store: { select: { name: true } }, items: true },
      }),
    ]);

    return {
      data: orders.map((o) => ({
        id: `#${o.id.slice(0, 4).toUpperCase()}`,
        cliente: o.customerName,
        loja: o.store.name,
        total_itens: o.items.reduce((acc, i) => acc + i.quantity, 0),
        valor_total: Number(o.total),
        status: orderStatusToLabel(o.status),
        data: toDDMMYYYY(o.createdAt),
      })),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async getOrderById(id: string) {
    const cleanId = id.startsWith('#') ? id.slice(1) : id;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: cleanId }, { id: { startsWith: cleanId.toLowerCase() } }] },
      include: { store: true, items: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
    });
    if (!order) throw new AppError(404, 'Pedido não encontrado', 'ORDER_NOT_FOUND');

    return {
      id: `#${order.id.slice(0, 4).toUpperCase()}`,
      cliente: order.customerName,
      loja: order.store.name,
      total_itens: order.items.reduce((acc, i) => acc + i.quantity, 0),
      valor_total: Number(order.total),
      status: orderStatusToLabel(order.status),
      data: toDDMMYYYY(order.createdAt),
      itens: order.items.map((item) => ({
        produto: item.product,
        quantidade: item.quantity,
        preco_unitario: Number(item.price),
        subtotal: Number(item.price) * item.quantity,
      })),
      endereco_entrega: order.deliveryAddress ?? '',
      historico_status: order.statusHistory.map((h) => ({ status: orderStatusToLabel(h.status), data: h.createdAt.toISOString() })),
    };
  }

  async listCatalogs(params: { search?: string; loja_id?: string }) {
    const { search, loja_id } = params;
    const where: Prisma.CatalogWhereInput = {
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      ...(loja_id ? { storeId: loja_id } : {}),
    };
    const [total, catalogs] = await Promise.all([
      prisma.catalog.count({ where }),
      prisma.catalog.findMany({ where, orderBy: { updatedAt: 'desc' }, include: { store: true } }),
    ]);
    return {
      data: catalogs.map((c) => ({
        id: c.id,
        loja: c.store.name,
        loja_id: c.storeId,
        nome: c.name,
        categorias: c.categories,
        total_produtos: 0,
        data_atualizacao: c.updatedAt.toISOString(),
        status: catalogStatusToLabel(c.status),
      })),
      total,
    };
  }

  async updateCatalogStatus(actorUserId: string, id: string, status: 'Publicado' | 'Pausado') {
    const before = await prisma.catalog.findUnique({ where: { id } });
    if (!before) throw new AppError(404, 'Catálogo não encontrado', 'CATALOG_NOT_FOUND');
    const mapped = status === 'Publicado' ? 'PUBLICADO' : 'PAUSADO';
    const updated = await prisma.catalog.update({ where: { id }, data: { status: mapped } });
    await this.audit({
      actorUserId,
      action: 'PATCH_CATALOG_STATUS',
      entityType: 'catalog',
      entityId: id,
      beforeData: before as unknown as Prisma.InputJsonValue,
      afterData: updated as unknown as Prisma.InputJsonValue,
    });
    return { id: updated.id, status: catalogStatusToLabel(updated.status) };
  }

  async listProducts(params: { page: number; limit: number; loja_id?: string; categoria?: string; status?: string; search?: string }) {
    const { page, limit, loja_id, categoria, status, search } = params;
    const where: Prisma.ProductWhereInput = {
      ...(loja_id ? { storeId: loja_id } : {}),
      ...(categoria ? { category: { equals: categoria, mode: 'insensitive' } } : {}),
      ...(status ? { status: status === 'Ativo' ? 'ATIVO' : 'INATIVO' } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    };
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { store: true },
      }),
    ]);
    return {
      data: products.map((p) => ({
        id: p.id,
        nome: p.name,
        loja: p.store.name,
        loja_id: p.storeId,
        categoria: p.category ?? 'Sem categoria',
        preco: Number(p.price),
        estoque: p.stock,
        status: productStatusToLabel(p.status),
        imagem_url: p.image ?? null,
      })),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async updateProductStatus(actorUserId: string, id: string, status: 'Ativo' | 'Inativo') {
    const before = await prisma.product.findUnique({ where: { id } });
    if (!before) throw new AppError(404, 'Produto não encontrado', 'PRODUCT_NOT_FOUND');
    const mapped = status === 'Ativo' ? 'ATIVO' : 'INATIVO';
    const updated = await prisma.product.update({
      where: { id },
      data: { status: mapped, available: mapped === 'ATIVO' },
    });
    await this.audit({
      actorUserId,
      action: 'PATCH_PRODUCT_STATUS',
      entityType: 'product',
      entityId: id,
      beforeData: before as unknown as Prisma.InputJsonValue,
      afterData: updated as unknown as Prisma.InputJsonValue,
    });
    return { id: updated.id, status: productStatusToLabel(updated.status) };
  }

  async deleteProduct(actorUserId: string, id: string) {
    const before = await prisma.product.findUnique({ where: { id } });
    if (!before) throw new AppError(404, 'Produto não encontrado', 'PRODUCT_NOT_FOUND');
    await prisma.product.delete({ where: { id } });
    await this.audit({
      actorUserId,
      action: 'DELETE_PRODUCT',
      entityType: 'product',
      entityId: id,
      beforeData: before as unknown as Prisma.InputJsonValue,
    });
    return { deleted: true };
  }
}
