// Mock Prisma client for development without database
interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'TENANT_ADMIN' | 'MANAGER' | 'VIEWER';
  tenantId: string;
  password: string;
  isActive: boolean;
  avatar?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MockTenant {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data
const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    email: 'admin@demo.com',
    firstName: 'Admin',
    lastName: 'Demo',
    role: 'TENANT_ADMIN',
    tenantId: 'tenant-1',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/QwGd3k9Z8uR7F9Xl2', // password123
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const mockTenants: MockTenant[] = [
  {
    id: 'tenant-1',
    name: 'Demo Company',
    slug: 'demo-company',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const mockPrisma = {
  user: {
    findFirst: async ({ where, include }: any) => {
      const user = mockUsers.find(u => u.email === where?.email && (!where?.isActive || u.isActive));
      if (!user) return null;
      
      return {
        ...user,
        tenant: include?.tenant ? mockTenants.find(t => t.id === user.tenantId) : undefined,
      };
    },
    findUnique: async ({ where, include }: any) => {
      const user = mockUsers.find(u => u.id === where?.id || u.email === where?.email);
      if (!user) return null;
      
      return {
        ...user,
        tenant: include?.tenant ? mockTenants.find(t => t.id === user.tenantId) : undefined,
      };
    },
    update: async ({ where, data }: any) => {
      const userIndex = mockUsers.findIndex(u => u.id === where?.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...data, updatedAt: new Date() };
        return mockUsers[userIndex];
      }
      return null;
    },
    create: async (data: any) => {
      const newUser: MockUser = {
        id: `user-${Date.now()}`,
        email: data.data?.email || data.email,
        firstName: data.data?.firstName || data.firstName,
        lastName: data.data?.lastName || data.lastName,
        role: (data.data?.role || data.role || 'USER') as any,
        tenantId: data.data?.tenantId || data.tenantId,
        password: data.data?.password || data.password,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.push(newUser);
      return newUser;
    },
  },
  tenant: {
    findFirst: async ({ where }: any) => {
      return mockTenants.find(t => t.slug === where?.slug) || null;
    },
    findUnique: async ({ where }: any) => {
      return mockTenants.find(t => t.slug === where?.slug || t.id === where?.id) || null;
    },
    create: async (data: any) => {
      const newTenant: MockTenant = {
        id: `tenant-${Date.now()}`,
        name: data.data?.name || data.name,
        slug: data.data?.slug || data.slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTenants.push(newTenant);
      return newTenant;
    },
  },
  offer: {
    findMany: async ({ where }: any) => {
      return []; // Empty array for now
    },
    count: async ({ where }: any) => {
      return 0;
    },
    create: async (data: any) => {
      return {
        id: `offer-${Date.now()}`,
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  },
  client: {
    findMany: async ({ where }: any) => {
      return []; // Empty array for now
    },
    count: async ({ where }: any) => {
      return 0;
    },
    create: async (data: any) => {
      return {
        id: `client-${Date.now()}`,
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  },
  $transaction: async (operations: any) => {
    // Mock transaction - execute operations sequentially
    if (typeof operations === 'function') {
      // Function-based transaction
      const tx = {
        user: mockPrisma.user,
        tenant: mockPrisma.tenant,
        offer: mockPrisma.offer,
        client: mockPrisma.client,
      };
      return await operations(tx);
    } else {
      // Array-based transaction
      const results = [];
      for (const op of operations) {
        results.push(await op);
      }
      return results;
    }
  },
};