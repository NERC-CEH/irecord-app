<h3><%= obj.question %></h3>
<div class="buttons">
  <button id="btn-negative" class="btn btn-clear"><%= obj.negativeOption %></button>

    <% if (obj.link) { %>
      <a id="btn-positive" class="btn btn-positive" href='mailto:apps%40ceh.ac.uk?subject=iRecord%20App%20Support%20%26%20Feedback&body=%0A%0A%0AVersion%3A%20<%- obj.version %>%0ABrowser%3A <%- window.navigator.appVersion %>%0A'><%= obj.positiveOption %></a>
  <% } else { %>
    <button id="btn-positive" class="btn btn-positive">
      <%= obj.positiveOption %>
    </button>
  <% } %>

</div>

