<template>
  <b-container fluid>
    <b-row class="pt-5 d-flex justify-content-center text-center">
      <b-col lg="12" class="mb-3 mt-5">
        <h5>Kimliğinizi seçiniz.</h5>
      </b-col>
      <b-col lg="3">
        <b-card class="identity-card">
          <b-card-text class="display-4 mb-0">
            <i class="ri-user-6-line"></i>
          </b-card-text>
          <b-card-text>
            Furkan Ayvaz
          </b-card-text>
        </b-card>
      </b-col>
      <b-col lg="3">
        <b-card class="identity-card">
          <b-card-text class="display-4 mb-0">
            <i class="ri-user-6-line"></i>
          </b-card-text>
          <b-card-text>
            Serkan Mert Kaptan
          </b-card-text>
        </b-card>
      </b-col>
      <b-col lg="3">
        <b-card class="identity-card">
          <b-card-text class="display-4 mb-0">
            <i class="ri-user-6-line"></i>
          </b-card-text>
          <b-card-text>
            Serhat Ayhan
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import genericMethods from "../mixins/genericMethods";

export default {
  mixins: [genericMethods],
  data() {
    return {
      filter: {}
    }
  },
  methods: {
    getCustomers() {
      return []
    }
  }
}
</script>
<style>
.identity-card {
  transition: .2s all ease-out;
  cursor:pointer
}
.identity-card:hover {
  transform: scale(1.05);
}
</style>

