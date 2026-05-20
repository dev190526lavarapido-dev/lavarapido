# login/page.tsx

## LoginPage

ESTADO: serverError = null (string | null)
ESTADO: isPending = false (via useTransition)

SCHEMA zod
  email: string email valido, msg "Email invalido"
  password: string minimo 6 caracteres, msg "Minimo 6 caracteres"

FORM react-hook-form com zodResolver(schema)

## onSubmit

RECEBE: data (FormData)
FACA
  setServerError(null)
  startTransition async
    resultado = login(data) → server action auth
    SE resultado.error FACA
      setServerError(resultado.error)

RENDERIZA
  div fundo gradiente radial (amarelo canto sup-esq, brand canto inf-dir)
    div maxWidth=380 centralizado

    CABECALHO
      logo "LR" 76x76px rounded bg-brand shadow-lg
      h1 "Bom te ver de volta!"
      p "Entra ai pra cuidar da galera de hoje."

    FORMULARIO onSubmit=handleSubmit(onSubmit)
      campo Email
        label htmlFor="email" "Email"
        input id="email" type=email register("email") autocomplete=email
        SE errors.email FACA span texto errors.email.message

      campo Senha
        label htmlFor="password" "Senha"
        input id="password" type=password register("password") autocomplete=current-password
        SE errors.password FACA span texto errors.password.message

      SE serverError FACA div erro centralizado bg-rose/10 texto serverError

      botao type=submit disabled=isPending
        SE isPending FACA "Entrando..."
        SENAO FACA "Entrar no painel" + ArrowRight size=18

      p "Esquecer senha? Fala com o suporte."

    RODAPE
      Link href="/" icone Store "Ver vitrine publica"
