import { Request, Response } from "express";
import { cpf , cnpj} from 'cpf-cnpj-validator';
import {CadastroUser} from '../models/Usuarios';
import {Pessoa_Fisica} from '../models/PF';
import { Op } from 'sequelize';
import {Pessoa_Juridica} from '../models/PJ';
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Listar_usuario } from "../models/Usuario_v";
import {View_usuario} from '../models/Usuarioview';
dotenv.config();

/*
    cd_usuario: string;
    ds_senha: string;
    ds_email: string;
    cd_perfil: number;
    ie_status: boolean;
*/
export async function Registro_user(req: Request, res: Response) {
    let cd_usuario: string = req.body.cd_usuario;
    let ds_email: string = req.body.ds_email;
    let ds_senha: string = req.body.ds_senha;
    let cd_perfil: number = req.body.cd_perfil;
    let ie_status: boolean = true;
    const cod_user = await View_usuario.findOne({where: {cd_usuario}})
    if(!cod_user)
    {
        res.json({error: 'Pessoa não cadastrada!'})
    }
    else{
        let email_user = await CadastroUser.findOne({where: {ds_email}})
        if(email_user)
        {
            res.json({error: 'email já cadastrada!'})
        }
        else
        {
            const hash_senha = await bcrypt.hashSync(ds_senha, 10)
            const playload = (Date.now()+ Math.random()).toString();
            const token = await bcrypt.hashSync(playload, 10);
            let novoUsuario = await CadastroUser.create({cd_usuario, ds_email, ds_senha: hash_senha, cd_token: token, cd_perfil, ie_status})
            res.status(201).json({novoUsuario})
        }
    }
}
export const Login = async(req:Request, res:Response)=>{
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
export const edit_user = async(req:Request, res:Response)=>{
    const erros = validationResult(req);
    if(!erros.isEmpty()){
        res.json({error: erros.mapped()});
        return;
    };
 
    let token: string = req.body.token;
    const user = await CadastroUser.findOne({where:{cd_token: token}})
    let usuario = user?.cd_usuario as string
    let descricao = req.body.descricao;
    let ds_cidade = req.body.ds_cidade;
    let ds_endereco = req.body.ds_endereco;
    let ds_estado = req.body.ds_estado;
    let ds_telefone = req.body.ds_telefone;
    let ds_email = req.body.ds_email;
    let ds_senha = req.body.ds_senha;
    let dt_nascimento = req.body.dt_nascimento;
    const validacao = cpf.isValid(usuario)
    if(validacao)
    {
        if(descricao)
        {
            const pf = await Pessoa_Fisica.findOne({where:{cd_cpf: usuario}});
            if(pf)
            {
                pf.nm_nome= descricao
                pf.dt_atualizacao = new Date();
                await pf.save()
            }
        }
        if(ds_cidade)
        {
            const pf = await Pessoa_Fisica.findOne({where:{cd_cpf: usuario}})
            if(pf)
            {
                pf.ds_cidade= ds_cidade
                pf.dt_atualizacao = new Date();
                await pf.save()
            }
            
        }
        if(ds_endereco)
        {
            const pf = await Pessoa_Fisica.findOne({where:{cd_cpf: usuario}})
            if(pf)
            {
                pf.ds_endereco= ds_endereco
                pf.dt_atualizacao = new Date();
                await pf.save()
            }
        }
        if(ds_estado)
        {
            const pf = await Pessoa_Fisica.findOne({where:{cd_cpf: usuario}})
            if(pf)
            {
                pf.ds_estado= ds_estado
                pf.dt_atualizacao = new Date();
                await pf.save()
            }
        }
        if(ds_telefone)
        {
            const pf = await Pessoa_Fisica.findOne({where:{cd_cpf: usuario}})
            if(pf)
            {
                pf.ds_telefone= ds_telefone
                pf.dt_atualizacao = new Date();
                await pf.save()
            }
        }
        if(ds_email)
        {
            const email = await CadastroUser.findOne({where:{ds_email}})
            if(email)
            {
                res.json({ error: "E-mail já cadastrado!" });
                return;
            }
            else
            {
                if(user)
                {
                    user.ds_email = ds_email;
                    await user.save()
                }
            }
        }
        if(ds_senha)
        {
            if(user)
            {
                const hash_senha = await bcrypt.hashSync(ds_senha, 10)
                user.ds_senha = hash_senha;
                await user.save()
            }
        }
        if(dt_nascimento)
        {
            const pf = await Pessoa_Fisica.findOne({where:{cd_cpf: usuario}})
            if(pf)
            {
                pf.dt_nascimento= dt_nascimento
                pf.dt_atualizacao = new Date();
                await pf.save()
            }
        }
    }
    const valid_cnpj = cnpj.isValid(usuario)
    if(valid_cnpj)
    {
        if(descricao)
        {
            const pj = await Pessoa_Juridica.findOne({where:{cd_cnpj: usuario}});
            if(pj)
            {
                pj.nm_empresarial= descricao
                pj.dt_atualizacao = new Date();
                await pj.save()
            }
        }
        if(ds_cidade)
        {
            const pj = await Pessoa_Juridica.findOne({where:{cd_cnpj: usuario}});
            if(pj)
            {
                pj.ds_cidade= ds_cidade
                pj.dt_atualizacao = new Date();
                await pj.save()

            }
        }
        if(ds_endereco)
        {
            const pj = await Pessoa_Juridica.findOne({where:{cd_cnpj: usuario}});
            if(pj)
            {
                pj.ds_endereco= ds_endereco
                pj.dt_atualizacao = new Date();
                await pj.save()
            }
        }
        if(ds_estado)
        {
            const pj = await Pessoa_Juridica.findOne({where:{cd_cnpj: usuario}});
            if(pj)
            {
                pj.ds_estado= ds_estado
                pj.dt_atualizacao = new Date();
                await pj.save()
            }
        }
        if(ds_telefone)
        {
            const pj = await Pessoa_Juridica.findOne({where:{cd_cnpj: usuario}});
            if(pj)
            {
                pj.ds_telefone= ds_telefone
                pj.dt_atualizacao = new Date();
                await pj.save()
            }
        }
        if(ds_email)
        {
            const email = await CadastroUser.findOne({where:{ds_email}})
            if(email)
            {
                res.json({ error: "E-mail já cadastrado!" });
                return;
            }
            else
            {
                if(user)
                {
                    user.ds_email = ds_email;
                    await user.save()
                }
            }
        }
        if(ds_senha)
        {
            if(user)
            {
                const hash_senha = await bcrypt.hashSync(ds_senha, 10)
                user.ds_senha = hash_senha;
                await user.save()
            }
        }
    }

    res.json({});
    
}
export const Inativar = async (req: Request, res: Response)=>{
    let token = req.body.token;
    let cd_usuario = req.body.cd_usuario;
    const user = await CadastroUser.findOne({where:{cd_token: token}})
    let perfil = user?.cd_perfil
    if(perfil == 1)
    {
        const userin = await CadastroUser.findOne({where:{cd_usuario}})
        if(userin){
            let bool = userin.ie_status;
            if(bool == true)
            {
                userin.ie_status = false;
            await userin.save();
            res.status(201).json({item: userin});
            }
            else
            {
                userin.ie_status = true;
                await userin.save();
                res.status(201).json({item: userin});
            }
        }
        else{
            res.json({error: 'Usuario não encontrado'});
        }
    }
    else {
        res.json({error: 'Perfil não autorizado para Inativar/Ativar Usuarios'});
    }
}
export const bucar_Usuario = async(req:Request, res:Response)=>{
    const errors = validationResult(req);
    if(errors.isEmpty())
    {
        let token = req.body.token;
        const detalhes_usuario = await CadastroUser.findOne({where:{cd_token: token}})
        if(detalhes_usuario)
        {
            let descricao = req.body.descricao;
            const user = await Listar_usuario.findAll({where:{descricao:{[Op.like]: `%${descricao.toUpperCase()}%`},  ie_status: true}})
            res.json({user});
        }
    }
    else 
    {
        return res.json({status: errors.mapped()})
    }
}
export const esqueci_senha = async(req:Request, res:Response)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({ error: errors.mapped() });
        return;
    };
    let ds_email: string = req.body.ds_email;
    let cd_usuario: string = req.body.cd_usuario;
    let user = await CadastroUser.findOne({where:{ds_email, cd_usuario}});
    if(!user)
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
    res.json({token})
    }
}

export const Detalhes = async(req:Request, res:Response)=>{
    const errors = validationResult(req);
    if(errors.isEmpty())
    {
        let token: string = req.body.token;
        const detalhes_usuario = await CadastroUser.findOne({where:{cd_token: token}});
        if(detalhes_usuario)
        {
            let cd_usuario = detalhes_usuario?.cd_usuario as string
            const cpfvalidation = cpf.isValid(cd_usuario)
            if(cpfvalidation)
            {
                const pf = await Pessoa_Fisica.findOne({where:{cd_cpf:detalhes_usuario.cd_usuario}})
                let detalhepf ={
                    cd_usuario : pf?.cd_cpf,
                    nm_nome: pf?.nm_nome ,
                    ds_email: detalhes_usuario.ds_email,
                    dt_nascimento: pf?.dt_nascimento,
                    ds_telefone: pf?.ds_telefone,
                    ds_estado: pf?.ds_estado,
                    ds_cidade: pf?.ds_cidade,
                    ds_endereco: pf?.ds_endereco
                }
                return res.json({user: detalhepf})
            }
            else
            {
                const pj = await Pessoa_Juridica.findOne({where:{cd_cnpj:detalhes_usuario.cd_usuario}})
                let detalhepj ={
                    cd_usuario : pj?.cd_cnpj,
                    nm_empresarial: pj?.nm_empresarial ,
                    ds_email: detalhes_usuario.ds_email,
                    ds_telefone: pj?.ds_telefone,
                    ds_estado: pj?.ds_estado,
                    ds_cidade: pj?.ds_cidade,
                    ds_endereco: pj?.ds_endereco
                }
                return res.json({user: detalhepj})
            }
        }
    }
    else 
    {
        return res.json({status: errors.mapped()})
    }
    
}