<option selected value="<%= movie.name %>">
          <%= movie.name %>
        </option>
        <% for (moviename of movies) {%>
          <option value="<%= moviename.name %> ">
            <%= moviename.name %>
          </option>
          <% } %>