export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-black mb-8" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
          Политика конфиденциальности
        </h1>

        <div className="space-y-6 text-zinc-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-black mb-2 text-zinc-900">Какие данные мы собираем</h2>
            <p>При входе через Roblox мы получаем ваш никнейм и аватар. Эти данные используются только для создания дизайна футболки и не передаются третьим лицам.</p>
          </section>

          <section>
            <h2 className="text-xl font-black mb-2 text-zinc-900">Как мы используем данные</h2>
            <p>Данные вашего аккаунта Roblox используются исключительно для отображения вашего персонажа в конструкторе футболок. Мы не храним пароли и не имеем доступа к вашему аккаунту Roblox.</p>
          </section>

          <section>
            <h2 className="text-xl font-black mb-2 text-zinc-900">Cookies</h2>
            <p>Мы используем сессионные cookies для поддержания вашей авторизации на сайте. Cookies автоматически удаляются при закрытии браузера.</p>
          </section>

          <section>
            <h2 className="text-xl font-black mb-2 text-zinc-900">Контакты</h2>
            <p>По вопросам конфиденциальности пишите на: kirillakimov3@gmail.com</p>
          </section>
        </div>

        <a href="/" className="mt-10 inline-flex rounded-2xl border-2 border-zinc-900 bg-black px-6 py-3 font-black text-white shadow-[3px_3px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
          ← На главную
        </a>
      </div>
    </main>
  );
}
