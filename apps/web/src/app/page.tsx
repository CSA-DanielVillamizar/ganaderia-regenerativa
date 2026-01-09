import Link from 'next/link';
import { Button } from '@web/components/common/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-700 mb-4">🐄 Magrotec</h1>
        <p className="text-gray-700 mb-8 text-lg">Ganadería Regenerativa Inteligente</p>
        <Link href="/farms">
          <Button variant="primary" size="lg">
            Ir al Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
