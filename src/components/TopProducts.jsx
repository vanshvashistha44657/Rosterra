import { TrendingUp } from 'lucide-react'

const products = [
  { id: 1, name: 'Premium Plan', sales: 1245, revenue: '$24,500', growth: '+12.5%' },
  { id: 2, name: 'Basic Plan', sales: 892, revenue: '$17,840', growth: '+8.2%' },
  { id: 3, name: 'Enterprise Plan', sales: 456, revenue: '$45,600', growth: '+15.3%' },
  { id: 4, name: 'Starter Plan', sales: 234, revenue: '$4,680', growth: '+5.1%' },
]

function TopProducts() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
          <p className="text-sm text-gray-600">Best performing products</p>
        </div>
        <TrendingUp className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-700 font-bold text-sm">#{index + 1}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">{product.sales} sales</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{product.revenue}</p>
              <p className="text-sm text-green-600">{product.growth}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
        View all products
      </button>
    </div>
  )
}

export default TopProducts
