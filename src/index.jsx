import createDi from "app/di"
import bootstrap from "app/bootstrap"

const di = createDi()

bootstrap(di)

const app = di.get('app')

app.run()