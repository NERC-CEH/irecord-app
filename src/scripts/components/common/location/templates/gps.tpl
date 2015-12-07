<% switch (obj.state) {
case ('finished'): %>
<div class="success-message">
  <p>Success!</p>
  <p>Accuracy: <%- obj.accuracy %> meters</p>
</div>
<% break;
case ('running'): %>
<div class="info-message">
  <p>We are trying to get your location. This might take a
    few minutes...</p>
  <% if (obj.accuracy) { %>
  <p>Accuracy: <%- obj.accuracy %> meters
    (need less than <%- app.CONF.GPS_ACCURACY_LIMIT %>m)</p>
  <% } %>
</div>
<% break;
default: %>
<div class="info-message">
  <p>We will try to determine your location
    using the inbuilt phone GPS.</p>

  <p> Please make sure you have turned the phone's
    geolocation on and are well away from large objects.<br/> e.g. <i>trees,
      buildings </i></p>
</div>
<% }%>

<button id="gps-button"
        class="btn btn-narrow btn-positive btn-block">Locate</button>

