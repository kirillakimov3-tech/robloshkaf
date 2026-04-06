export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="inline-flex rounded-full border px-3 py-1 text-sm mb-4">
              Roblox футболка-конфигуратор
            </p>
            <h1 className="text-5xl font-black leading-tight">
              Создай футболку со своим Roblox-персонажем
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-xl">
              Войди через Roblox, подтяни своего персонажа и сразу собери принт для печати.
            </p>
            <div className="mt-8 flex gap-4">
              <a
                href="/api/roblox/login"
                className="rounded-2xl bg-black text-white px-6 py-3 font-medium"
              >
                Войти через Roblox
              </a>
              <a
                href="/designer"
                className="rounded-2xl border px-6 py-3 font-medium"
              >
                Открыть демо
              </a>
            </div>
          </div>

          <div className="rounded-[32px] border bg-white p-6 shadow-sm">
            <div className="aspect-[4/5] rounded-[28px] bg-zinc-100 flex items-center justify-center text-zinc-400 text-lg">
              Здесь будет мокап футболки / промо-блок
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}