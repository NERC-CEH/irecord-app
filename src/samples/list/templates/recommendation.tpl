<h3><%= obj.question %></h3>
<div class="buttons">
  <ion-button id="btn-negative" fill="clear"><%= obj.negativeOption %></ion-button>

    <% if (obj.link) { %>
      <ion-button id="btn-positive" href='mailto:apps%40ceh.ac.uk?subject=iRecord%20App%20Support%20%26%20Feedback&body=%0A%0A%0AVersion%3A%20<%- obj.version %>%0ABrowser%3A <%- window.navigator.appVersion %>%0A'><%= obj.positiveOption %></ion-button>
  <% } else { %>
    <ion-button id="btn-positive">
      <%= obj.positiveOption %>
    </ion-button>
  <% } %>

</div>

