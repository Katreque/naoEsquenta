import React, { Component } from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
const {ipcRenderer} = window.require("electron");

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      carregado: false,
      instalacaoNode: true,
      instalacaoSvn: true,
      status: "Carregando...",
      erro: undefined
    }

    this._encerrar = this._encerrar.bind(this);
    this.iniciaVerificacaoSvn = this.iniciaVerificacaoSvn.bind(this);
    this.execucaoPosVerificaoDependencias = this.execucaoPosVerificaoDependencias.bind(this);
  }

  componentDidMount() {
    this.iniciaVerificacaoNode();
  }

  iniciaVerificacaoNode() {
    this._possuiNodeInstalado()
    .then((res) => {
      if (!!res.proximoEstagio) {
        return this.iniciaVerificacaoSvn();
      } else {
        this.setState({
          instalacaoNode: false
        })
      }
    })
  }

  iniciaVerificacaoSvn() {
    this.setState({
      instalacaoNode: true
    })

    this._possuiTortoiseInstalado()
    .then((res) => {
      if (!!res.proximoEstagio) {
        return this.execucaoPosVerificaoDependencias();
      } else {
        this.setState({
          instalacaoSvn: false
        })
      }
    })
  }

  execucaoPosVerificaoDependencias() {
    this.setState({
      instalacaoSvn: true
    })

    this._executaBatExtensao("executa-bat-referente", "Recuperando dados do SVN")
      .then(() => {
        return this._executaBatExtensao("roda-npm-i", "Instalando dependências da Extensão");
      })
      .then(() => {
        return this._executaBatExtensao("build-extensao", "Preparando a melhor Extensão da Alterdata");
      })
      .then(() => {
        return this._descompactaExtensao();
      })
      .then(() => {
        this.setState({
          status: "Recarregue a extensão no seu navegador e está pronto para uso!",
          carregado: true
        })
      })
      .catch(() => {
        this.setState({
          carregado: true
        })
      })
  }

  _executaBatExtensao(nomeEvento, statusInicial, relativePathBat) {
    return new Promise((resolve, reject) => {
      this.setState({
        status: statusInicial
      })

      ipcRenderer.on(nomeEvento + '-resposta', (event, arg) => {
        return resolve();
      });

      ipcRenderer.on(nomeEvento + '-resposta-error', (event, arg) => {
        this.setState({
          erro: arg
        })

        return reject();
      });

      let data = {
        caminho: relativePathBat
      }

      ipcRenderer.send(nomeEvento, data);
    })
  }

  _descompactaExtensao() {
    return new Promise((resolve, reject) => {
      this.setState({
        status: "Descompactando arquivos"
      })

      ipcRenderer.on("extrai-extensao-resposta", (event, arg) => {
        return resolve();
      });

      ipcRenderer.on("extrai-extensao-resposta-error", (event, arg) => {
        this.setState({
          erro: arg
        })

        return reject();
      });

      ipcRenderer.send("extrai-extensao");
    })
  }


  //TODO: Verificar uma maneira de pegar o ID da instalação e atualizar no JSON automaticamente
  _ajustaIdExtensaoDll() {
    return new Promise((resolve, reject) => {
      this.setState({
        status: "Empacotando tudo de novo"
      })

      ipcRenderer.on("ajusta-id-dll-resposta", (event, arg) => {
        return resolve();
      });

      ipcRenderer.on("ajusta-id-dll-resposta-error", (event, arg) => {
        this.setState({
          erro: arg
        })

        return reject();
      });

      ipcRenderer.send("ajusta-id-dll");
    })
  }

  _possuiNodeInstalado() {
    return new Promise((resolve, reject) => {
      this.setState({
        status: "Verificando instalação Node"
      })

      ipcRenderer.on("possui-node-instalado-resposta", (event, arg) => {
        return resolve({proximoEstagio: true});
      });

      ipcRenderer.on("possui-node-instalado-resposta-error", (event, arg) => {
        ipcRenderer.on("instala-node-resposta", (event, arg) => {
          return resolve({proximoEstagio: false});
        });

        ipcRenderer.on("instala-node-resposta-error", (event, arg) => {
          this.setState({
            erro: arg
          })

          return reject();
        });

        ipcRenderer.send("instala-node");
      });

      ipcRenderer.send("possui-node-instalado");
    })
  }

  _possuiTortoiseInstalado() {
    return new Promise((resolve, reject) => {
      this.setState({
        status: "Verificando instalação do SVN"
      })

      ipcRenderer.on("possui-tortoise-instalado-resposta", (event, arg) => {
        resolve({proximoEstagio: true});
      });

      ipcRenderer.on("possui-tortoise-instalado-resposta-error", (event, arg) => {
        ipcRenderer.on("instala-tortoise-resposta", (event, arg) => {
          resolve({proximoEstagio: false});
        });

        ipcRenderer.on("instala-tortoise-resposta-error", (event, arg) => {
          this.setState({
            erro: arg
          })

          reject();
        });

        ipcRenderer.send("instala-tortoise");
      });

      ipcRenderer.send("possui-tortoise-instalado");
    })
  }

  _encerrar() {
    return ipcRenderer.send("encerrar");
  }

  //TODO: Refatorar a view em componentes menores.

  render() {
    if(!!this.state.erro) {
      return (
        <div className="App">
          <div className="container text-center" style={{paddingTop: 80 + "px"}}>
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Parece que ocorreu um erro</h3>
                <p className="card-text">{this.state.erro}</p>
                <FontAwesomeIcon icon="times-circle" size="2x" />
              </div>
              <div className="card-footer text-muted">
                <p className="card-text">By Katreque PogChamp!</p>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (!this.state.carregado && !this.state.instalacaoNode) {
      return(
        <div className="App">
          <div className="container text-center" style={{paddingTop: 80 + "px"}}>
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Em andamento</h3>
                <p className="card-text">Após a instalação do Node, continue:</p>
                <button className="btn btn-dark" onClick={this.iniciaVerificacaoSvn}>Continuar</button>
              </div>
              <div className="card-footer text-muted">
                <p className="card-text">By Katreque PogChamp!</p>
              </div>
            </div>
          </div>
        </div>
      )
    } else if (!this.state.carregado && !this.state.instalacaoSvn) {
      return(
        <div className="App">
          <div className="container text-center" style={{paddingTop: 80 + "px"}}>
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Em andamento</h3>
                <p className="card-text">Após a instalação do SVN, continue:</p>
                <button className="btn btn-dark" onClick={this.execucaoPosVerificaoDependencias}>Continuar</button>
              </div>
              <div className="card-footer text-muted">
                <p className="card-text">By Katreque PogChamp!</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (!this.state.carregado) {
      return(
        <div className="App">
          <div className="container text-center" style={{paddingTop: 80 + "px"}}>
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Em andamento</h3>
                <p className="card-text">{this.state.status}</p>
                <FontAwesomeIcon icon="spinner" spin size="2x" />
              </div>
              <div className="card-footer text-muted">
                <p className="card-text">By Katreque PogChamp!</p>
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="App">
          <div className="container text-center" style={{paddingTop: 80 + "px"}}>
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Tudo Pronto</h3>
                <p className="card-text">{this.state.status}</p>
                <button className="btn btn-dark" onClick={this._encerrar}>Encerrar</button>
              </div>
              <div className="card-footer text-muted">
                <p className="card-text">By Katreque PogChamp!</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default App;
