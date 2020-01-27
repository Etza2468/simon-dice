const celeste = document.getElementById('celeste')
const violeta = document.getElementById('violeta')
const naranja = document.getElementById('naranja')
const verde = document.getElementById('verde')
const boton = document.getElementById('botonEmpezar');

const tiempo = document.getElementById('tiempo');
const nivel = document.getElementById('nivel');
const puntos = document.getElementById('puntos');
const barraProgreso = document.getElementById('barraProgreso');
const blip = zounds.load("sounds/blip.wav");

const ULTIMO_NIVEL = 10;
const TOTAL_PUNTOS = 10;
const TIEMPO_MAX = 10;

const delay = time => new Promise(resolveCallback => setTimeout(resolveCallback, time));

tiempo.innerHTML = TIEMPO_MAX;

class Juego{
    constructor(){
        this.inicializar();
        this.generarSecuencia();
        delay(500) 
            .then(this.siguienteNivel); 
    }

    inicializar(){
        this.siguienteNivel = this.siguienteNivel.bind(this);
        this.elegirColor = this.elegirColor.bind(this); 
        boton.classList.toggle('hide');
        
        this.nivel = 1;
        nivel.innerHTML = this.nivel;
        puntos.innerHTML = 0;

        this.actualizarProgreso(0);

        this.colores = {
            celeste,
            violeta,
            naranja,
            verde
        }
    
        this.coloresArray = Object.values(this.colores);
    }

    generarSecuencia(){
        this.secuencia = new Array(ULTIMO_NIVEL).fill(0).map(n => Math.floor(Math.random() * 4));
    }

    siguienteNivel(){
        this.subnivel = 0;  
        nivel.innerHTML = this.nivel;
        this.progreso = 100 / this.nivel;
        this.porcentaje = 0;
        this.contador = TIEMPO_MAX;

        this.actualizarProgreso(this.porcentaje);
        this.iluminarSecuencia()
            .then(() => {
                this.subnivel = 0;
                this.contadorDeTiempo();
                this.agregarEventos();
            });
    }

    contadorDeTiempo() {
        this.cronometro = setInterval(() => {
          this.contador--;
          if (this.contador === 0) {
            clearInterval(this.cronometro);
            this.perderJuego();
          } else {
            tiempo.innerText = this.contador;
          }
        }, 1000);
      }

    transformarNumeroAColor(numero){
        switch(numero){
            case 0:
                return 'celeste';
            case 1:
                return 'violeta';
            case 2:
                return 'naranja';
            case 3:
                return 'verde';
        }
    }

    transformarColorANumero(color){
        switch(color){
            case 'celeste':
                return 0;
            case 'violeta':
                return 1;
            case 'naranja':
                return 2;
            case 'verde':
                return 3;
        }
    }

    iluminarSecuencia(){
        return new Promise((resolve) => {
            for(let i = 0; i < this.nivel; i++){
                const color = this.transformarNumeroAColor(this.secuencia[i]);
                delay(1000 * i)
                    .then(this.iluminarColor.bind(this, color, resolve));
            }
        });
    }

    iluminarColor(color, resolve){
        this.colores[color].classList.add('target', 'light')
        blip.play();
        delay(350)
            .then(this.apagarColor.bind(this, color, resolve));
    }

    apagarColor(color, resolve){
        this.colores[color].classList.remove('target', 'light');
        if(resolve){
            this.subnivel++;
            if(this.subnivel === this.nivel){
                resolve();
            }
        }
    }

    agregarEventos(){
        this.coloresArray.forEach(colores => {
            colores.addEventListener('click', this.elegirColor); 
        });
    }

    eliminarEventos(){
        this.coloresArray.forEach(colores => {
            colores.removeEventListener('click', this.elegirColor);
        });
    }

    actualizarProgreso(porcentaje){
        barraProgreso.style.width = `${porcentaje}%`;
    }

    elegirColor(e){

        const nombreColor = e.target.dataset.color;
        const numeroColor = this.transformarColorANumero(nombreColor);
        this.iluminarColor(nombreColor) ;
        
        if(numeroColor === this.secuencia[this.subnivel]){
           
            this.subnivel++;
            this.porcentaje += this.progreso;
            this.agregarPuntos();
            this.actualizarProgreso(this.porcentaje)

            if(this.subnivel === this.nivel){
                this.nivel++;
                this.eliminarEventos();
                this.pararContador();
                if(this.nivel === (ULTIMO_NIVEL + 1)){
                    this.ganoJuego();
                }else{
                    swal('¿Listo para más?', `ir al nivel ${this.nivel}`, 'success')
                        .then(() => {
                            this.actualizarProgreso(0)
                            return delay(500)
                        })
                        .then(this.siguienteNivel);
                }
            }

        }else{
            this.perderJuego();
        }
    }

    agregarPuntos(){
        puntos.innerHTML = parseInt(puntos.innerHTML) + TOTAL_PUNTOS;
    }

    ganoJuego(){
        swal('Simon Dice', '¡Felicitaciones, ganaste el juego!', 'success')
            .then(() =>{
                this.inicializar();
            });
    }

    perderJuego(){
        this.pararContador();
        swal('Perdiste', `Total de puntos: ${puntos.innerHTML}`, 'error')
        .then(() =>{
            this.eliminarEventos();
            this.inicializar();
        });
    }

    pararContador(){
        clearInterval(this.cronometro);
        tiempo.innerHTML = TIEMPO_MAX;
    }
}


function empezarJuego(e){
    window.juego = new Juego();
}

boton.addEventListener('click', empezarJuego);