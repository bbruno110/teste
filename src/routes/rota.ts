import { Router, Request, Response } from 'express';
import { Autorizacao } from "../middlewares/autorizacao";
import * as pfcontroller from '../controllers/pfController';
import * as cadUserController from '../controllers/Usuario';
import * as CategoriaController from "../controllers/Categoria_Controller";
import * as NutrienteController from "../controllers/Nutriente_Controller";
import * as Ingredientes_Controller from "../controllers/Ingredientes_Controller";
import * as Receita_controller from "../controllers/Receita";
import * as uservalidator from '../Validator/Cadastro_user'
import * as ingvalidator from '../Validator/Ingrediente_Validator';
import bcrypt from 'bcrypt';
import { cpf , cnpj} from 'cpf-cnpj-validator';
import {CadastroUser} from '../models/Usuarios';
import {Pessoa_Fisica} from '../models/PF';
import {Pessoa_Juridica} from '../models/PJ';
import { validationResult } from 'express-validator';



const router = Router();

router.get('/', (req:Request, res:Response) => {return res.json({ message: 'backend works!' })});
router.post("/login", 
async(req:Request, res:Response)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({ error: errors.mapped() });
        return;
    };
    let ds_email: string = req.body.ds_email;
    let ds_senha: string = req.body.ds_senha;
    let user = await CadastroUser.findOne({where:{ds_email}});
    if(!user)
    {
        res.json({ error: "E-mail e/ou senhas errados!" });
        return;
    }
    const match = await bcrypt.compare(ds_senha, user?.ds_senha as string)
    if(!match)
    {
        res.json({ error: "E-mail e/ou senhas errados!" });
        return;
    }
    let cd = await CadastroUser.findByPk(user?.cd_usuario)
    if(cd)
    {
    const playload = (Date.now() + Math.random()).toString();
    const token = await bcrypt.hashSync(playload,10);
    cd.cd_token = token
    await cd.save();
    res.json({cd})
    }
}


);
router.post("/cadastro/Pessoa",Autorizacao.private, pfcontroller.criarPessoa);
router.post("/cadastro", uservalidator.usuario, cadUserController.Registro_user);
router.post("/esqueci-senha", cadUserController.esqueci_senha);
router.get("/me", Autorizacao.private, cadUserController.Detalhes);
router.put("/user/me", Autorizacao.private, cadUserController.edit_user);
router.put("/user/me/In-At", Autorizacao.private, cadUserController.Inativar);
router.get("/user/busca", Autorizacao.private, cadUserController.bucar_Usuario);

router.post("/criar-ingrediente", Autorizacao.private,ingvalidator.Criar_ING , Ingredientes_Controller.NovoIngrediente);
router.post("/criar-ingrediente/Cat", Autorizacao.private, Ingredientes_Controller.Criar_CAT_ING);
router.post("/criar-ingrediente/Nut", Autorizacao.private, Ingredientes_Controller.Criar_Nut_ING);
router.get("/lista-ingrediente", Autorizacao.private, Ingredientes_Controller.ListarIngrediente);

router.delete("/delete-ingrediente", Autorizacao.private, Ingredientes_Controller.Delete_ing);
router.delete("/delete-ingrediente/nutriente", Autorizacao.private, Ingredientes_Controller.Delete_nut_ing);
router.delete("/delete-ingrediente/categoria", Autorizacao.private, Ingredientes_Controller.Delete_cat_ing);

router.post("/Cad-Nutriente", Autorizacao.private, NutrienteController.CriarNut);
router.put("/At-Nutriente", Autorizacao.private, NutrienteController.atualizarNut);
router.put("/Inativar-Nutriente", Autorizacao.private, NutrienteController.Inativar);
router.get("/Nutriente", Autorizacao.private, NutrienteController.ListarNutriente);
router.get("/busca-Nutriente", Autorizacao.private, NutrienteController.ListarNutriente);

router.post("/Cad-Categoria", Autorizacao.private, CategoriaController.criarCategoria);
router.get("/Categoria", Autorizacao.private, CategoriaController.ListarCategoria);
router.get("/busca-Categoria", Autorizacao.private, CategoriaController.PesquisarCategoria);
router.put("/Inativar-Categoria", Autorizacao.private, CategoriaController.Inativar);
router.put("/At-Categoria", Autorizacao.private, CategoriaController.atualizarCat);

router.post("/Receita", Autorizacao.private, Receita_controller.Criar_Receita);
router.get("/Receita", Autorizacao.private, Receita_controller.Listar_receitas);
router.post("/Receita/Ingrediente", Autorizacao.private, Receita_controller.Criar_ING_Rec);
router.post("/Receita/Preparo", Autorizacao.private, Receita_controller.modo_Preparo);
export default router;