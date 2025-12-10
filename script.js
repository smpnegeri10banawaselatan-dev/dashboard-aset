const SPREADSHEET_URL = "https://script.google.com/macros/s/AKfycbxNqh5TPxd4a6aSM62Kxqh4-L-O4CtS7TAFXfzKSexjYlbyMmVPkzyP1QR_M4cic6OV/exec"; // ganti dengan WebApp URL

let asetData = [];

fetch(SPREADSHEET_URL)
.then(response => response.json())
.then(data => {
  asetData = data;
  renderStats(asetData);
  renderCharts(asetData);
  renderTable();
  initMap(asetData);
});

function renderStats(data){
  let tanah = data.filter(d=>d.Jenis_Aset==='Tanah').length;
  let bangunan = data.filter(d=>d.Jenis_Aset==='Bangunan').length;
  let lengkap = data.filter(d=>d.Tanggal_Berlaku && new Date(d.Tanggal_Berlaku) > new Date()).length;
  let masalah = data.length - lengkap;

  document.getElementById('totalTanah').innerText = tanah;
  document.getElementById('totalBangunan').innerText = bangunan;
  document.getElementById('statusLengkap').innerText = lengkap;
  document.getElementById('statusMasalah').innerText = masalah;
}

function renderCharts(data){
  new Chart(document.getElementById('jenisChart'),{
    type:'pie',
    data:{
      labels:['Tanah','Bangunan'],
      datasets:[{data:[
        data.filter(d=>d.Jenis_Aset==='Tanah').length,
        data.filter(d=>d.Jenis_Aset==='Bangunan').length
      ], backgroundColor:['#0066CC','#009688'] }]
    },
    options:{ responsive:true, maintainAspectRatio:false }
  });

  new Chart(document.getElementById('statusChart'),{
    type:'doughnut',
    data:{
      labels:['Lengkap','Masalah'],
      datasets:[{data:[
        data.filter(d=>d.Tanggal_Berlaku && new Date(d.Tanggal_Berlaku) > new Date()).length,
        data.length - data.filter(d=>d.Tanggal_Berlaku && new Date(d.Tanggal_Berlaku) > new Date()).length
      ], backgroundColor:['#009688','#E53935'] }]
    },
    options:{ responsive:true, maintainAspectRatio:false }
  });
}

function renderTable(){
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  const filter = document.getElementById('filterJenis').value;
  const filtered = asetData.filter(d=>filter==='' || d.Jenis_Aset===filter);

  const headerRow = document.getElementById('tableHeader');
  if(headerRow.innerHTML===''){
    Object.keys(filtered[0]).forEach(k=>{
      let th = document.createElement('th'); th.innerText=k; headerRow.appendChild(th);
    });
  }

  filtered.forEach(row=>{
    let tr = document.createElement('tr');
    Object.values(row).forEach(val=>{
      let td = document.createElement('td'); 
      if(typeof val==='string' && (val.startsWith('http://') || val.startsWith('https://'))){
        td.innerHTML = `<a href="${val}" target="_blank">Link</a>`;
      } else td.innerText=val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function initMap(data){
  const map = new google.maps.Map(document.getElementById('map'),{
    zoom: 5,
    center: {lat:-2.5, lng:118} 
  });

  data.forEach(d=>{
    const lat = parseFloat(d.Latitude);
    const lng = parseFloat(d.Longitude);
    if(!isNaN(lat)&&!isNaN(lng)){
      const marker = new google.maps.Marker({position:{lat, lng}, map, title:d.Nama_Aset});
      const info = new google.maps.InfoWindow({
        content:`<b>${d.Nama_Aset}</b><br>${d.Lokasi}<br><a href="${d.Link_Sertifikat}" target="_blank">Sertifikat</a>`
      });
      marker.addListener('click',()=>info.open(map, marker));
    }
  });
}
