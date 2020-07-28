import React, { Component } from 'react';
import SpeechRecognition from "../speech-recognition";
import Axios from 'axios';
import { Pie } from "react-chartjs-2";
import { Line } from "react-chartjs-2";

const googleTrends = require('google-trends-api');

//Graph data options
var startDate = new Date(2018, 9, 28, 0,0,0,0);
//Graph formatting options
const options = {
   maintainAspectRatio: false,
   legend: {
      labels: {
         fontColor: 'white',
         boxWidth: 10
      }
   }
};

let lang = findGetParameter('lang') || 'en-US'
let lastTranscript = ''

function findGetParameter(parameterName) {
   var result = null,
       tmp = [];
   window.location.search
       .substr(1)
       .split("&")
       .forEach(function (item) {
         tmp = item.split("=");
         if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
       });
   return result;
}

class Slide extends Component {
   //constructor
   constructor (props) {
      super(props);

      this.state = {
         header: "",
         list: [],
         title: "",
         author: "",
         img: "",
         name: "",
         titleReal: "",
         detail: false
      };
   }

   //Title slide
   makeTitle (title, author) {
      title = title.replace(/today/ig, '').replace(/,/g, '').trim();
      author = author.replace(/,/g, '').trim()
      if (author.trim() == 'in') author = 'David';
      this.setState({
         title: title,
         author: author,
         list: [],
         header: '',
         img: '',
         pieChart: '',
         lineChart: '',
         detail: false
      })
   }

   //Image slide
   makeImage (title, src) {
      this.setState({
         header: title,
         list: [],
         title: '',
         author: "",
         img: src,
         pieChart: '',
         lineChart: '',
         detail: false
      })
   }

   //Info slide
   makeDetails (title) {
      this.setState({
         header: title,
         list: [],
         title: '',
         author: "",
         img: '',
         pieChart: '',
         lineChart: '',
         detail: new Date()
      })
   }

   //Append more details to current slide
   addDetails (details) {
      this.setState({
         list: this.state.list.concat(details)
      })
   }

   //Pie chart slide
   makePieChart (leftCompare, rightCompare) {
      //Google trends API call
      googleTrends.interestOverTime({
         keyword: [leftCompare,rightCompare],
         startTime: startDate,
      })
          .then(function (results) {
             console.log('TrendResults: ', results);
          })
          .catch(function(err){
             console.error('Error with google trends API', err);
          });
      this.setState({
         header: leftCompare + ' vs ' + rightCompare,
         list: [],
         title: '',
         author: "",
         img: '',
         pieChart: 'true',
         lineChart: '',
         labels: [
            leftCompare,
            rightCompare,
         ],
         datasets: [{
            data: [324, 173],
            backgroundColor: [
               '#FF6384',
               '#36A2EB',
            ],
            hoverBackgroundColor: [
               '#FF6384',
               '#36A2EB',
            ]
         }]
      })
   }
   //Line chart slide
   makeLineChart (lineData) {
      //Google trends API call
      googleTrends.interestOverTime({
         keyword: lineData,
         startTime: startDate,
      })
          .then(function (results) {
             console.log('TrendResults: ', results);
             //extract data from results
             var extractedResults = [];
             extractedResults.push(results.default.timelineData[0].value);
          })
          .catch(function(err){
             console.error('Error with google trends API', err);
          });

      this.setState({
         header: lineData + ' over time',
         list: [],
         title: '',
         author: "",
         img: '',
         pieChart: '',
         lineChart: 'true',
         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
         datasets: [
            {
               label: lineData,
               fill: false,
               lineTension: 0.1,
               backgroundColor: 'rgba(75,192,192,0.4)',
               borderColor: 'rgba(75,192,192,1)',
               borderCapStyle: 'butt',
               borderDash: [],
               borderDashOffset: 0.0,
               borderJoinStyle: 'miter',
               pointBorderColor: 'rgba(75,192,192,1)',
               pointBackgroundColor: '#fff',
               pointBorderWidth: 1,
               pointHoverRadius: 5,
               pointHoverBackgroundColor: 'rgba(75,192,192,1)',
               pointHoverBorderColor: 'rgba(220,220,220,1)',
               pointHoverBorderWidth: 2,
               pointRadius: 1,
               pointHitRadius: 10,
               data: [45, 50, 60, 75, 80, 75, 83]
            }
         ]
      })
   }

   //Clear slide
   clear () {
      this.setState({
         header: '',
         list: [],
         title: '',
         author: "",
         img: '',
         pieChart: '',
         lineChart: '',
         detail: false
      });
   }

   componentWillReceiveProps (props) {
      //GIPHY API key
      console.log(props.finalTranscript)
      if (props.finalTranscript == lastTranscript) return
      lastTranscript = props.finalTranscript
      // if (props.finalTranscript.trim().length === 0) return
      if (lang == 'en-US') {
         this.update(props, props.finalTranscript);
      } else {
         Axios.get('http://localhost:5000/translate?sentence=' + props.finalTranscript).then(res => {
            this.update(props, res.data);
         })
      }
   }

   update (props, transcript) {
      transcript = transcript.toLowerCase();
      const GIPHY = "Zy6dt9yS4zp0Lt2OYAtNK2V9OPDnGOng";
      //analyse transcript
      const image = transcript.search(/((image|picture) of|(look at?))/) >= 0 ? transcript.substring(transcript.search(/((image|picture) of|look at)/) + (transcript.indexOf('picture') >= 0 ? 10 : 8)).split(' ') : [];
      const whatIs = transcript.search(/(((what|who)( is| are|'s|'re))|give you|give to you)/) >= 0 ? transcript.substring(transcript.search(/(((what|who)( is| are|'s|'re))|give you|give to you)/) + 8).split(' ') : [];
      const title = transcript.match(/(I'm|I am|i am|i'm|My name is|my name is) ([^ ]+).+(talk about|discuss|look at|going over|talking about) ([^\.]+)/);
      const end = transcript.search(/(thank you for|thanks for)/);
      const skip = transcript.search(/(skip(ped)? a slide)/);
      //graph transcription reading
      const pieChart = transcript.match(/((graph|chart) of) (.+) (vs|versus|vs.) ([^\.]+)/);
      const lineChart = transcript.match(/((graph|chart) of) (.+) over time/);
      const summarizeStart = transcript.match(/at? (.+) ((in|and) depth|(in|and) detail|(in|and) more detail|(in|and) more depth)/)
      console.log(transcript);
      //summarize start
      if (summarizeStart) {
           props.resetTranscript();
           this.makeDetails(summarizeStart[1]);
      }
      //image slide
      else if (image.length >= 2 && transcript.search(/(graph|chart)/) < 0) {
         props.resetTranscript();
         const URL = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY}&limit=1&q=${image.join(' ')}`;
         fetch(URL)
            .then(response => response.json())
            .then(content => {
               console.log( content.data[0].images);
               this.makeImage(image.join(' '), content.data[0].images.original.url);
            })
            .catch(err => {
               console.error(err);
            });
      }
      //content slide (uncommented no man's land)
      else if (whatIs.length >= 1) {
         props.resetTranscript();
         this.makeDetails(whatIs.join(' '));
         Axios.get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${whatIs.join(' ')}&prop=info&inprop=url&utf8=&origin=*&format=json`).then(res => {
            const title = res.data.query.search[0].title;
            Axios.get(`https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=${title}&callback&origin=*`).then(res => {
               console.log(res);
               res = JSON.parse(res.data.substring(5, res.data.length - 1));
               console.log(res);
               const pageId = Object.keys(res.query.pages)[0];
               const text = res.query.pages[pageId].extract;
               const firstSentence = text.substring(0, text.indexOf('. '));
               this.addDetails(['~ ' + firstSentence]);
               const URL = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY}&limit=1&q=cute ${title}`;
               fetch(URL)
                  .then(response => response.json())
                  .then(content => {
                     console.log( content.data[0].images);
                     this.addDetails([`<img src='${content.data[0].images.original.url}' style='height: 300px; width: auto; margin-top: 50px ' />`]);
                  })
                  .catch(err => {
                     console.error(err);
                  });
            }).catch(e => console.log(e));
         }).catch(e => console.log(e));
      }
      //title slide
      else if (title) {
         console.log(title);
         props.resetTranscript();
         this.makeTitle(title[4], title[2]);
         this.setState({ name: title[2], titleReal: title[4] });
      }
      //end slide
      else if (end >= 0) {
         props.resetTranscript();
         this.makeTitle("Thank you", this.state.name);
      }
      //skip slide
      else if (skip >= 0) {
         props.resetTranscript();
         this.makeTitle(this.state.titleReal, this.state.name);
      } else if (this.state.detail) {
         if (((new Date()) - this.state.detail) > 1000 && transcript.trim().length > 0) {
            props.resetTranscript();
            this.setState({ detail: new Date() })
            Axios.get('http://localhost:5000/?sentence='+transcript).then(res => {
               for (let i in res.data) {
                  setTimeout(() => this.addDetails(["~ " + res.data[i]]), 400 * parseInt(i))
               }
            });
         }
      }
      //makePieChart on prompt
      else if (pieChart) {
         props.resetTranscript();
         console.log(pieChart);
         this.makePieChart(pieChart[3],pieChart[5]);
      }
      //makeLineChart on prompt
      else if (lineChart) {
         props.resetTranscript();
         console.log(lineChart);
         this.makeLineChart(lineChart[3]);
      }
   }

   //render page HTML
   render = () => (
      <div>
         {/*Title*/}
         { this.state.title ? <h1 style={{fontSize: 30/Math.sqrt(this.state.title.length + 1) + 'em'}}>{this.state.title}</h1> : null }
         {/*Author*/}
         { this.state.author ? <h3>{this.state.author}</h3> : null }
         {/*Header*/}
         { this.state.header ? <h2 className={this.state.header}>{this.state.header}</h2> : null }
         {/*List*/}
         { this.state.list ? <ul>{this.state.list.map(v => <li dangerouslySetInnerHTML={{__html: v}}/>)}</ul> : null }
         {/*Image*/}
         { this.state.img ? <img src={this.state.img} /> : null }
         {/*Pie Chart*/}
         { this.state.pieChart ? <Pie data={this.state} options={options}/> : null }
         {/*Line Chart*/}
         { this.state.lineChart ? <Line data={this.state} options={options}/> : null }
         <span className='transcript'>{ this.props.transcript }</span>
      </div>
   )
}

// ar-YE
// zh-CN
// en-US

export default SpeechRecognition({ lang })(Slide);
