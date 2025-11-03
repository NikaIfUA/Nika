<template>
  <v-container>
    <h1 class="text-h4 text-center font-weight-bold my-6">
      Наші контакти
    </h1>

    <section class="mb-8">
      <h2 class="text-h5 font-weight-medium text-center mb-3">Ми на карті</h2>
      
      <v-responsive :aspect-ratio="16/9" class="border rounded-lg">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2616.400467211608!2d24.366453077168085!3d49.0219899713549!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4730a2fbde597253%3A0x6682cffca89b8a21!2sMaysternya%20Reklamy%20%22Nika%22!5e0!3m2!1sru!2sua!4v1761662032607!5m2!1sru!2sua" 
          width="100%" 
          height="100%" 
          style="border:0;" 
          loading="lazy" 
          referrerpolicy="no-referrer-when-downgrade"></iframe>
      </v-responsive>
    </section>
  </v-container>
  
    <section>
      <v-card>
        <v-container>
          <v-row no-gutters>
            
            <v-col cols="12" md="6"> 
              <v-card-title class="text-h6">
                Наша адреса
              </v-card-title>
              <v-card-text class="text-medium-emphasis">
                <p><strong>NIKA</strong></p>
                <p>Україна, м. Калуш</p>
                <p>вул. Грушевського, 15</p>
                <p>тел. 067 764 89 19, 066 724 92 84</p>
              </v-card-text>
            </v-col>

            <v-col cols="12" md="6"> 
              <v-card-title class="text-h6">
                Ми в соцмережах
              </v-card-title>
              
              <v-list bg-color="transparent" lines="one">
                <v-list-item
                  href="https://www.facebook.com/people/Дизайн-студія-Nika/100063669091798/"
                  target="_blank"
                  prepend-icon="mdi-facebook"
                  title="Facebook"
                  color="blue"
                ></v-list-item>

                <v-list-item
                  href="viber://chat?number=0955830316"
                  target="_blank"
                  prepend-icon="mdi-viber"
                  title="Viber"
                  color="purple-darken-1"
                ></v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </section>

</template>

<script setup lang="ts">
</script>

<style scoped>
.v-card-text p {
  margin-bottom: 4px;
  font-size: 1rem;
  line-height: 1.6;
}
</style>