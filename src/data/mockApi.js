// Mock API responses used by the simulator's axios mock
export const MOCK_RESPONSES = {
  // GET endpoints
  'GET:/api/users': { status: 200, data: [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
    { id: 2, name: 'Bob Smith',     email: 'bob@example.com',   role: 'user'  },
    { id: 3, name: 'Carol White',   email: 'carol@example.com', role: 'user'  },
  ]},
  'GET:/api/orders': { status: 200, data: [
    { id: 1, userId: 1, total: 129.99, status: 'delivered' },
    { id: 2, userId: 1, total: 49.50,  status: 'shipped'   },
    { id: 3, userId: 2, total: 89.00,  status: 'pending'   },
    { id: 4, userId: 3, total: 19.99,  status: 'delivered' },
    { id: 5, userId: 3, total: 299.00, status: 'processing'},
  ]},
  'GET:/api/products': { status: 200, data: [
    { id: 1, name: 'Laptop Pro',    price: 1299.99, category: 'electronics' },
    { id: 2, name: 'Wireless Mouse',price: 49.99,   category: 'electronics' },
    { id: 3, name: 'Standing Desk', price: 499.00,  category: 'furniture'   },
    { id: 4, name: 'Notebook Set',  price: 12.99,   category: 'stationery'  },
  ]},
  'GET:/api/posts': { status: 200, data: [
    { id: 1, title: 'Getting Started with Express', views: 1200 },
    { id: 2, title: 'Axios vs Fetch',               views: 980  },
    { id: 3, title: 'React Query Deep Dive',        views: 2100 },
  ]},
  'GET:/api/tasks': { status: 200, data: [
    { id: 1, title: 'Set up Express',     done: true,  createdAt: '2025-01-01T10:00:00Z' },
    { id: 2, title: 'Add Axios',          done: true,  createdAt: '2025-01-02T10:00:00Z' },
    { id: 3, title: 'Learn React Query',  done: false, createdAt: '2025-01-03T10:00:00Z' },
  ]},
  'GET:/api/todos': { status: 200, data: [
    { id: 1, text: 'Buy groceries', done: false },
    { id: 2, text: 'Write tests',   done: false },
    { id: 3, text: 'Deploy app',    done: true  },
  ]},
  // dynamic GET patterns
  'GET:/api/users/': { status: 200, data: { id: 1, name: 'Alice Johnson', email: 'alice@example.com' } },
  'GET:/api/products/': { status: 200, data: { id: 1, name: 'Laptop Pro', price: 1299.99 } },
  'GET:/api/tasks/': { status: 200, data: { id: 1, title: 'Set up Express', done: true } },
  // Generic fallback GETs
  'GET:https://api.example.com/users': { status: 200, data: [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob',   email: 'bob@example.com'   },
  ]},
  'GET:https://api.example.com/products': { status: 200, data: [
    { id: 1, name: 'Widget A', price: 29.99 },
    { id: 2, name: 'Widget B', price: 49.99 },
  ]},
  'GET:https://api.example.com/items': { status: 200, data: [
    { id: 1, name: 'Apple',  category: 'fruit',  price: 1.5  },
    { id: 2, name: 'Carrot', category: 'veggie', price: 0.5  },
  ]},
  'GET:https://api.example.com/missing': { status: 404, data: { error: 'Not found' } },
  'GET:https://api.example.com/profile': { status: 200, data: { message: 'Profile loaded', user: 'alice' } },
  'GET:https://api.myapp.com/v1/users': { status: 200, data: [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob',   role: 'user'  },
  ]},
  'GET:https://api.myapp.com/v1/products': { status: 200, data: [
    { id: 1, name: 'Pro Plan', price: 99 },
  ]},
  'GET:https://api.myapp.com/data': { status: 200, data: { message: 'Secured data retrieved' } },
  'GET:https://api.myapp.com/v1/me': { status: 200, data: { id: 1, name: 'Alice', plan: 'pro' } },
  'GET:/users': { status: 200, data: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] },
  'GET:/products': { status: 200, data: [{ id: 1, name: 'Laptop', price: 999 }] },
  'GET:/me': { status: 200, data: { id: 1, name: 'Alice', plan: 'pro' } },

  // POST endpoints
  'POST:/api/users': { status: 201, data: { id: 99, name: 'New User', email: 'new@example.com', createdAt: new Date().toISOString() } },
  'POST:/api/tasks': { status: 201, data: { id: 99, title: 'New Task', done: false, createdAt: new Date().toISOString() } },
  'POST:/api/orders': { status: 201, data: { id: 99, userId: 1, total: 149.99, status: 'pending' } },
  'POST:https://api.example.com/users': { status: 201, data: { id: 99, name: 'Alice Johnson', email: 'alice@example.com', createdAt: new Date().toISOString() } },
  'POST:https://api.myapp.com/v1/users': { status: 201, data: { id: 99, name: 'New User', email: 'new@myapp.com' } },
  'POST:/users': { status: 201, data: { id: 99, name: 'Test User', email: 't@t.com' } },
  'POST:/register': { status: 201, data: { message: 'Registered!', username: 'testuser', email: 'test@example.com' } },

  // PUT endpoints
  'PUT:/api/users/': { status: 200, data: { id: 1, name: 'Alice Updated', email: 'alice@example.com' } },
  'PUT:https://api.example.com/users/42': { status: 200, data: { id: 42, name: 'Alice Smith', email: 'alice.smith@example.com' } },
  'PUT:/api/users/1': { status: 200, data: { id: 1, name: 'Alice Updated', email: 'alice@example.com' } },

  // PATCH endpoints
  'PATCH:/api/tasks/': { status: 200, data: { id: 1, title: 'Set up Express', done: true } },
  'PATCH:/api/todos/': { status: 200, data: { id: 1, text: 'Buy groceries', done: true } },
  'PATCH:/api/users/': { status: 200, data: { id: 1, name: 'Alice', email: 'newemail@example.com' } },
  'PATCH:https://api.example.com/users/42': { status: 200, data: { message: 'Email updated', id: 42 } },

  // DELETE endpoints
  'DELETE:/api/users/': { status: 200, data: { deleted: true } },
  'DELETE:/api/tasks/': { status: 200, data: { deleted: true } },
  'DELETE:https://api.example.com/users/42': { status: 200, data: { deleted: true, id: 42 } },
  'DELETE:https://api.myapp.com/v1/users/': { status: 200, data: { deleted: true } },
  'DELETE:/users/': { status: 200, data: { deleted: true } },
}

// Resolve the best matching mock for a given method + url
export function resolveMock(method, url) {
  const key = `${method.toUpperCase()}:${url}`

  // Exact match first
  if (MOCK_RESPONSES[key]) return MOCK_RESPONSES[key]

  // Prefix match for dynamic routes (e.g. /api/users/5)
  const prefixMatch = Object.keys(MOCK_RESPONSES).find(k => {
    if (!k.startsWith(method.toUpperCase() + ':')) return false
    const pattern = k.replace(method.toUpperCase() + ':', '')
    if (pattern.endsWith('/') && url.startsWith(pattern)) return true
    return false
  })
  if (prefixMatch) return MOCK_RESPONSES[prefixMatch]

  // Partial hostname match
  const partialMatch = Object.keys(MOCK_RESPONSES).find(k => {
    if (!k.startsWith(method.toUpperCase() + ':')) return false
    const pattern = k.replace(method.toUpperCase() + ':', '')
    return url.includes(pattern.replace('https://', '').replace('http://', '').split('/')[0])
  })

  return partialMatch
    ? MOCK_RESPONSES[partialMatch]
    : { status: 200, data: { message: `Mock response for ${method} ${url}`, success: true } }
}
