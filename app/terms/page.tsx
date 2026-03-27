export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-black mb-8" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
          Условия использования
        </h1>

        <div className="space-y-6 text-zinc-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-black mb-2 text-zinc-900">Использование сервиса</h2>
            <p>Роблошкаф — сервис для создания футболок с вашим Roblox-аватаром. Используя сайт, вы соглашаетесь с данными условиями.</p>
          </section>

          <section>
            <h2 className="text-xl font-black mb-2 text-zinc-900">Заказы и оплата</h2>
            <p>После оформления заказа мы свяжемся с вами для подтверждения и оплаты. Производство начинается после получения оплаты.</p>
          </section>

          <section>
            <h2 className="text-xl font-black mb-2 text-zinc-900">Доставка</h2>
            <p>Сроки производства — 5-7 рабочих дней. Доставка по России — 3-10 рабочих дней в зависимости от региона.</p>
          </section>

          <section>
            <h2 className="text-xl font-black mb-2 text-zinc-900">Возврат</h2>
            <p>Поскольку каждая футболка изготавливается индивидуально, возврат возможен только в случае производственного брака.</p>
          </section>

          <section>
            <h2 className="text-xl font-black mb-2 text-zinc-900">Авторские права</h2>
            <p>Roblox и все связанные торговые марки принадлежат Roblox Corporation. Роблошкаф не аффилирован с Roblox Corporation.</p>
          </section>

          <section>
            <h2 className="text-xl font-black mb-2 text-zinc-900">Контакты</h2>
            <p>По всем вопросам: kirillakimov3@gmail.com</p>
          </section>
        </div>

        <a href="/" className="mt-10 inline-flex rounded-2xl border-2 border-zinc-900 bg-black px-6 py-3 font-black text-white shadow-[3px_3px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
          ← На главную
        </a>
      </div>
    </main>
  );
}
